import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

const SPEECH_RECOGNITION_LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  ur: 'ur-IN'
};

const getRecognitionLocale = (lang) => SPEECH_RECOGNITION_LOCALES[lang] || lang || 'en-IN';

const SpeechInput = ({ onResult, lang }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognition(null);
      return undefined;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = getRecognitionLocale(lang);

    recognitionInstance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trimStart();

      onResultRef.current(transcript);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast.error('Please allow microphone access for voice input');
      } else if (event.error === 'no-speech') {
        toast.error('I could not hear anything. Please try again.');
      } else if (event.error === 'network') {
        toast.error('Voice recognition needs an active internet connection in this browser');
      } else if (event.error === 'language-not-supported') {
        toast.error(`Voice input is not available for ${getRecognitionLocale(lang)}`);
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.onresult = null;
      recognitionInstance.onerror = null;
      recognitionInstance.onend = null;
      recognitionInstance.abort();
      setIsListening(false);
    };
  }, [lang]);

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast.success('Listening...');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all ${
        isListening 
          ? 'bg-red-100 text-red-600 animate-pulse' 
          : 'bg-orange-50 text-primary hover:bg-orange-100'
      }`}
      title={isListening ? "Stop listening" : "Start Voice Input"}
    >
      {isListening ? <MicOff size={22} /> : <Mic size={22} />}
    </button>
  );
};

export default SpeechInput;
