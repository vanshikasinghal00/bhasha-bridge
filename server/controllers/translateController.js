const axios = require('axios');
const Translation = require('../models/Translation');

// Language code to name mapping
const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
  kn: 'Kannada',
  ml: 'Malayalam',
  or: 'Odia',
  ur: 'Urdu'
};

const INDIC_SCRIPTS = [
  { key: 'devanagari', base: 0x0900, start: 0x0900, end: 0x097F },
  { key: 'bengali', base: 0x0980, start: 0x0980, end: 0x09FF },
  { key: 'gurmukhi', base: 0x0A00, start: 0x0A00, end: 0x0A7F },
  { key: 'gujarati', base: 0x0A80, start: 0x0A80, end: 0x0AFF },
  { key: 'odia', base: 0x0B00, start: 0x0B00, end: 0x0B7F },
  { key: 'tamil', base: 0x0B80, start: 0x0B80, end: 0x0BFF },
  { key: 'telugu', base: 0x0C00, start: 0x0C00, end: 0x0C7F },
  { key: 'kannada', base: 0x0C80, start: 0x0C80, end: 0x0CFF },
  { key: 'malayalam', base: 0x0D00, start: 0x0D00, end: 0x0D7F }
];

const URDU_SCRIPT = { key: 'urdu', start: 0x0600, end: 0x06FF };

const TARGET_SCRIPT_BY_LANG = {
  hi: 'devanagari',
  mr: 'devanagari',
  bn: 'bengali',
  pa: 'gurmukhi',
  gu: 'gujarati',
  or: 'odia',
  ta: 'tamil',
  te: 'telugu',
  kn: 'kannada',
  ml: 'malayalam',
  ur: 'urdu'
};

const DEVANAGARI_VOWELS = {
  अ: 'a',
  आ: 'aa',
  इ: 'i',
  ई: 'ee',
  उ: 'u',
  ऊ: 'oo',
  ऋ: 'ri',
  ए: 'e',
  ऐ: 'ai',
  ओ: 'o',
  औ: 'au'
};

const DEVANAGARI_MATRAS = {
  'ा': 'aa',
  'ि': 'i',
  'ी': 'ee',
  'ु': 'u',
  'ू': 'oo',
  'ृ': 'ri',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au'
};

const DEVANAGARI_CONSONANTS = {
  क: 'k',
  ख: 'kh',
  ग: 'g',
  घ: 'gh',
  ङ: 'ng',
  च: 'ch',
  छ: 'chh',
  ज: 'j',
  झ: 'jh',
  ञ: 'ny',
  ट: 't',
  ठ: 'th',
  ड: 'd',
  ढ: 'dh',
  ण: 'n',
  त: 't',
  थ: 'th',
  द: 'd',
  ध: 'dh',
  न: 'n',
  प: 'p',
  फ: 'ph',
  ब: 'b',
  भ: 'bh',
  म: 'm',
  य: 'y',
  र: 'r',
  ल: 'l',
  व: 'v',
  श: 'sh',
  ष: 'sh',
  स: 's',
  ह: 'h',
  ळ: 'l',
  क्ष: 'ksh',
  ज्ञ: 'gy'
};

const URDU_TO_DEVANAGARI = {
  ا: 'अ',
  آ: 'आ',
  ب: 'ब',
  پ: 'प',
  ت: 'त',
  ٹ: 'ट',
  ث: 'स',
  ج: 'ज',
  چ: 'च',
  ح: 'ह',
  خ: 'ख',
  د: 'द',
  ڈ: 'ड',
  ذ: 'ज',
  ر: 'र',
  ڑ: 'ड़',
  ز: 'ज',
  ژ: 'झ',
  س: 'स',
  ش: 'श',
  ص: 'स',
  ض: 'ज',
  ط: 'त',
  ظ: 'ज',
  ع: 'अ',
  غ: 'ग',
  ف: 'फ',
  ق: 'क',
  ک: 'क',
  گ: 'ग',
  ل: 'ल',
  م: 'म',
  ن: 'न',
  ں: 'ं',
  و: 'व',
  ہ: 'ह',
  ھ: 'ह',
  ء: '',
  ی: 'य',
  ے: 'े',
  'َ': 'ा',
  'ِ': 'ि',
  'ُ': 'ु',
  'ْ': '्',
  'ّ': '',
  'ً': 'ं',
  'ٍ': 'िं',
  'ٌ': 'ुं'
};

const DEVANAGARI_TO_URDU = {
  अ: 'ا',
  आ: 'آ',
  इ: 'اِ',
  ई: 'ای',
  उ: 'اُ',
  ऊ: 'او',
  ए: 'ے',
  ऐ: 'ای',
  ओ: 'و',
  औ: 'او',
  क: 'ک',
  ख: 'کھ',
  ग: 'گ',
  घ: 'گھ',
  च: 'چ',
  छ: 'چھ',
  ज: 'ج',
  झ: 'جھ',
  ट: 'ٹ',
  ठ: 'ٹھ',
  ड: 'ڈ',
  ढ: 'ڈھ',
  त: 'ت',
  थ: 'تھ',
  द: 'د',
  ध: 'دھ',
  न: 'ن',
  प: 'پ',
  फ: 'ف',
  ब: 'ب',
  भ: 'بھ',
  म: 'م',
  य: 'ی',
  र: 'ر',
  ल: 'ل',
  व: 'و',
  श: 'ش',
  ष: 'ش',
  स: 'س',
  ह: 'ہ',
  'ं': 'ں',
  'ँ': 'ں',
  'ा': 'ا',
  'ि': 'ِ',
  'ी': 'ی',
  'ु': 'ُ',
  'ू': 'و',
  'े': 'ے',
  'ै': 'َے',
  'ो': 'و',
  'ौ': 'و',
  '्': '',
  '़': ''
};

const detectIndicScript = (text) => {
  let bestMatch = null;
  let bestCount = 0;

  for (const script of INDIC_SCRIPTS) {
    let count = 0;
    for (const char of text) {
      const code = char.codePointAt(0);
      if (code >= script.start && code <= script.end) count += 1;
    }

    if (count > bestCount) {
      bestCount = count;
      bestMatch = script;
    }
  }

  return bestCount > 0 ? bestMatch : null;
};

const hasUrduScript = (text) => {
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code >= URDU_SCRIPT.start && code <= URDU_SCRIPT.end) return true;
  }
  return false;
};

const normalizeToDevanagari = (text, sourceScript) => {
  if (sourceScript.key === 'urdu') {
    return Array.from(text, (char) => URDU_TO_DEVANAGARI[char] ?? char).join('');
  }

  return Array.from(text, (char) => {
    const code = char.codePointAt(0);
    if (code < sourceScript.start || code > sourceScript.end) return char;
    return String.fromCodePoint(0x0900 + (code - sourceScript.base));
  }).join('');
};

const convertFromDevanagari = (text, targetScript) => {
  if (targetScript.key === 'urdu') {
    return Array.from(text, (char) => DEVANAGARI_TO_URDU[char] ?? char).join('');
  }

  return Array.from(text, (char) => {
    const code = char.codePointAt(0);
    if (code < 0x0900 || code > 0x097F) return char;
    return String.fromCodePoint(targetScript.base + (code - 0x0900));
  }).join('');
};

const romanizeDevanagari = (text) => {
  let output = '';

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (DEVANAGARI_VOWELS[char]) {
      output += DEVANAGARI_VOWELS[char];
      continue;
    }

    if (DEVANAGARI_CONSONANTS[char]) {
      output += DEVANAGARI_CONSONANTS[char];

      if (DEVANAGARI_MATRAS[next]) {
        output += DEVANAGARI_MATRAS[next];
        i += 1;
      } else if (next === '्') {
        i += 1;
      } else {
        output += 'a';
      }
      continue;
    }

    if (char === 'ं' || char === 'ँ') {
      output += 'n';
      continue;
    }

    if (char === 'ः') {
      output += 'h';
      continue;
    }

    if (char === '़' || char === '्') continue;

    output += char;
  }

  return output
    .replace(/\s+/g, ' ')
    .trim();
};

const transliterateIndicScript = (text, targetLang) => {
  const sourceScript = hasUrduScript(text) ? URDU_SCRIPT : detectIndicScript(text);
  const targetScriptKey = TARGET_SCRIPT_BY_LANG[targetLang];
  const targetScript = targetScriptKey === 'urdu'
    ? URDU_SCRIPT
    : INDIC_SCRIPTS.find((script) => script.key === targetScriptKey);

  if (!sourceScript) {
    return null;
  }

  const normalizedText = normalizeToDevanagari(text, sourceScript);

  if (targetLang === 'en') {
    return romanizeDevanagari(normalizedText);
  }

  if (!targetScript) {
    return null;
  }

  if (sourceScript.key === targetScript.key) {
    return text;
  }

  return convertFromDevanagari(normalizedText, targetScript);
};

const decodeHtmlEntities = (text) => text
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');

const isBadTranslation = (text) => {
  if (!text || !text.trim()) return true;

  const normalized = text.toLowerCase();
  return normalized.includes('this is an example name')
    || normalized.includes('kturtle')
    || normalized.includes('please see http')
    || normalized.includes('mymemory')
    || normalized.includes('translated.net');
};

const translateWithGoogle = async (sourceText, sourceLang, targetLang) => {
  const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
    params: {
      client: 'gtx',
      sl: sourceLang,
      tl: targetLang,
      dt: 't',
      q: sourceText
    },
    timeout: 15000
  });

  const translatedText = response.data?.[0]
    ?.map((part) => part?.[0])
    .filter(Boolean)
    .join('');

  if (isBadTranslation(translatedText)) {
    throw new Error('Google translation returned no usable text.');
  }

  return translatedText;
};

const translateWithMyMemory = async (sourceText, sourceLang, targetLang) => {
  const response = await axios.get('https://api.mymemory.translated.net/get', {
    params: {
      q: sourceText,
      langpair: `${sourceLang}|${targetLang}`
    },
    timeout: 15000
  });

  const translatedText = decodeHtmlEntities(response.data?.responseData?.translatedText || '');

  if (isBadTranslation(translatedText)) {
    throw new Error('MyMemory translation returned no usable text.');
  }

  return translatedText;
};

// @desc    Translate text using Google Translate with MyMemory fallback
// @route   POST /api/translate
exports.translate = async (req, res) => {
  try {
    const { sourceText, sourceLang, targetLang, translationType } = req.body;

    if (!sourceText || !sourceLang || !targetLang) {
      return res.status(400).json({ message: 'Please provide sourceText, sourceLang, and targetLang.' });
    }

    if (sourceText.length > 5000) {
      return res.status(400).json({ message: 'Text is too long. Maximum 5000 characters allowed.' });
    }

    if (!LANGUAGES[sourceLang] || !LANGUAGES[targetLang]) {
      return res.status(400).json({ message: 'Invalid language code.' });
    }

    if (sourceLang === targetLang) {
      return res.status(400).json({ message: 'Source and target languages must be different.' });
    }

    let translatedText;
    try {
      translatedText = await translateWithGoogle(sourceText, sourceLang, targetLang);
    } catch (googleError) {
      console.warn('Google translation failed, trying fallback:', googleError.message);
      translatedText = await translateWithMyMemory(sourceText, sourceLang, targetLang);
    }

    // Save translation to history if user is authenticated and DB is connected
    let savedTranslation = null;
    const mongoose = require('mongoose');
    if (req.user && mongoose.connection.readyState === 1) {
      try {
        savedTranslation = await Translation.create({
          userId: req.user._id,
          sourceText,
          translatedText,
          sourceLang,
          targetLang,
          translationType: translationType || 'text'
        });
      } catch (dbErr) {
        console.warn('History save failed (expected in No-DB mode):', dbErr.message);
      }
    }

    res.json({
      translatedText,
      sourceLang: LANGUAGES[sourceLang],
      targetLang: LANGUAGES[targetLang],
      translationId: savedTranslation ? savedTranslation._id : null
    });
  } catch (error) {
    console.error('Translation error:', error.message);
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ message: 'Translation request timed out. Please try again.' });
    }
    res.status(500).json({ message: 'Translation failed. Please try again later.' });
  }
};

// @desc    Transliterate text using Google Input Tools (Proxy to avoid CORS)
// @route   POST /api/translate/transliterate
exports.transliterate = async (req, res) => {
  try {
    const { text, lang } = req.body;
    
    if (!text || !lang) {
      return res.status(400).json({ message: 'Text and language code are required.' });
    }

    const localIndicResult = transliterateIndicScript(text, lang);
    if (localIndicResult) {
      return res.json({ result: localIndicResult });
    }

    const itcMap = {
      hi: 'hi-t-i0-und',
      bn: 'bn-t-i0-und',
      ta: 'ta-t-i0-und',
      te: 'te-t-i0-und',
      mr: 'mr-t-i0-und',
      gu: 'gu-t-i0-und',
      kn: 'kn-t-i0-und',
      ml: 'ml-t-i0-und',
      pa: 'pa-t-i0-und',
      or: 'or-t-i0-und',
      ur: 'ur-t-i0-und'
    };
    
    const itc = itcMap[lang] || 'hi-t-i0-und';
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    
    const response = await axios.get(url);
    if (response.data && response.data[0] === 'SUCCESS') {
      return res.json({ result: response.data[1][0][1][0] });
    }
    
    res.json({ result: text });
  } catch (error) {
    console.error('Transliteration backend error:', error.message);
    res.status(500).json({ message: 'Transliteration failed.' });
  }
};

// @desc    Generate speech audio for languages missing reliable browser voices
// @route   GET /api/translate/tts
exports.textToSpeech = async (req, res) => {
  try {
    const { text, lang } = req.query;

    if (!text || !lang) {
      return res.status(400).json({ message: 'Text and language code are required.' });
    }

    if (!LANGUAGES[lang]) {
      return res.status(400).json({ message: 'Invalid language code.' });
    }

    const response = await axios.get('https://translate.google.com/translate_tts', {
      params: {
        ie: 'UTF-8',
        q: text,
        tl: lang,
        client: 'tw-ob'
      },
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://translate.google.com/'
      }
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('TTS error:', error.message);
    return res.status(500).json({ message: 'Text-to-speech failed.' });
  }
};

// @desc    Get supported languages
// @route   GET /api/translate/languages
exports.getLanguages = (req, res) => {
  const languages = Object.entries(LANGUAGES).map(([code, name]) => ({
    code,
    name
  }));
  res.json({ languages });
};
