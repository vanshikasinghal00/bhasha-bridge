import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const OCR_LANGUAGES = {
  en: 'eng',
  hi: 'hin',
  bn: 'ben',
  ta: 'tam',
  te: 'tel',
  mr: 'mar',
  gu: 'guj',
  pa: 'pan',
  kn: 'kan',
  ml: 'mal',
  or: 'ori',
  ur: 'urd'
};

const AUTO_OCR_LANGUAGE = Object.values(OCR_LANGUAGES).join('+');

const MAX_IMAGE_SIDE = 2400;
const TARGET_MIN_SIDE = 1400;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Unable to read image'));
  };
  image.src = url;
});

const getOtsuThreshold = (histogram, totalPixels) => {
  let sum = 0;
  for (let i = 0; i < 256; i += 1) sum += i * histogram[i];

  let sumBackground = 0;
  let weightBackground = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let i = 0; i < 256; i += 1) {
    weightBackground += histogram[i];
    if (weightBackground === 0) continue;

    const weightForeground = totalPixels - weightBackground;
    if (weightForeground === 0) break;

    sumBackground += i * histogram[i];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const variance = weightBackground * weightForeground * ((meanBackground - meanForeground) ** 2);

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
};

const preprocessImage = async (file) => {
  const image = await loadImage(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestSide < TARGET_MIN_SIDE
    ? TARGET_MIN_SIDE / longestSide
    : Math.min(1, MAX_IMAGE_SIDE / longestSide);

  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  const histogram = new Array(256).fill(0);
  const luma = new Uint8Array(width * height);

  for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
    const gray = Math.round((0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2]));
    const contrasted = Math.max(0, Math.min(255, Math.round(((gray - 128) * 1.28) + 128)));
    luma[pixel] = contrasted;
    histogram[contrasted] += 1;
  }

  const threshold = getOtsuThreshold(histogram, width * height);
  for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
    const value = luma[pixel] > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob || file), 'image/png');
  });
};

const cleanExtractedText = (text) => text
  .replace(/\u000c/g, '')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const countMatches = (text, pattern) => (text.match(pattern) || []).length;

const detectLanguageFromText = (text, fallbackLang) => {
  const scores = {
    bn: countMatches(text, /[\u0980-\u09FF]/g),
    ta: countMatches(text, /[\u0B80-\u0BFF]/g),
    te: countMatches(text, /[\u0C00-\u0C7F]/g),
    gu: countMatches(text, /[\u0A80-\u0AFF]/g),
    pa: countMatches(text, /[\u0A00-\u0A7F]/g),
    kn: countMatches(text, /[\u0C80-\u0CFF]/g),
    ml: countMatches(text, /[\u0D00-\u0D7F]/g),
    or: countMatches(text, /[\u0B00-\u0B7F]/g),
    ur: countMatches(text, /[\u0600-\u06FF\u0750-\u077F]/g),
    en: countMatches(text, /[A-Za-z]/g)
  };

  const devanagariCount = countMatches(text, /[\u0900-\u097F]/g);
  if (devanagariCount > 0) {
    scores[fallbackLang === 'mr' ? 'mr' : 'hi'] = devanagariCount;
  }

  const [detectedLang, score] = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0];

  return score > 0 ? detectedLang : fallbackLang;
};

const ImageOCR = ({ onTextExtracted, sourceLang = 'en' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);
  const workerLangRef = useRef('');

  useEffect(() => () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const getWorker = async (language) => {
    if (workerRef.current && workerLangRef.current === language) {
      return workerRef.current;
    }

    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
    }

    const worker = await Tesseract.createWorker(language, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      }
    });

    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300'
    });

    workerRef.current = worker;
    workerLangRef.current = language;
    return worker;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setPreview(URL.createObjectURL(file));
    processImage(file);
    e.target.value = '';
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const processedImage = await preprocessImage(file);
      const worker = await getWorker(AUTO_OCR_LANGUAGE);
      const { data: { text } } = await worker.recognize(processedImage);
      const cleanedText = cleanExtractedText(text);
      const detectedLang = detectLanguageFromText(cleanedText, sourceLang);

      if (cleanedText) {
        onTextExtracted(cleanedText, detectedLang);
        toast.success('Text extracted successfully!');
      } else {
        toast.error('Could not find any text in this image');
      }
    } catch (err) {
      console.error(err);
      toast.error('OCR processing failed');
    } finally {
      setIsProcessing(false);
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 w-full h-full pointer-events-auto">
      {!isProcessing && !preview ? (
        <>
          <div 
            onClick={() => fileInputRef.current.click()}
            className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-primary cursor-pointer hover:bg-orange-100 transition-all border-2 border-dashed border-orange-200"
          >
            <Upload size={32} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Click to upload image</p>
            <p className="text-xs text-gray-500">Supports JPG, PNG (Contains text)</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-orange-200 shadow-lg bg-gray-50">
            {preview && <img src={preview} alt="Preview" className="w-full h-full object-contain opacity-50" />}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 p-4">
              <Loader2 size={32} className="text-primary animate-spin" />
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-primary">{progress}% Processing</span>
            </div>
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};

export default ImageOCR;
