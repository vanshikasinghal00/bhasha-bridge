import React, { useRef, useState, useEffect } from 'react';
import { Copy, Check, Repeat, Volume2, Mic, ImageIcon, Loader2, Star, Trash2, Languages, History, ArrowRight, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { translateText, addFavorite, checkFavorite, removeFavorite, getHistory, getFavorites, transliterateText, getTextToSpeechUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useUIContext } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import SpeechInput from './SpeechInput';
import ImageOCR from './ImageOCR';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'ur', name: 'Urdu (اردو)' }
];

const SPEECH_LOCALES = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi'],
  bn: ['bn-IN', 'bn-BD', 'bn'],
  ta: ['ta-IN', 'ta'],
  te: ['te-IN', 'te'],
  mr: ['mr-IN', 'mr', 'hi-IN'],
  gu: ['gu-IN', 'gu', 'hi-IN'],
  pa: ['pa-IN', 'pa'],
  kn: ['kn-IN', 'kn'],
  ml: ['ml-IN', 'ml'],
  or: ['or-IN', 'or'],
  ur: ['ur-IN', 'ur-PK', 'ur']
};

const SERVER_TTS_LANGS = new Set(['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'kn', 'ml', 'or', 'ur']);

const transliterateGurmukhiToDevanagari = (text) => Array.from(text, (char) => {
  const code = char.codePointAt(0);
  if (code < 0x0A00 || code > 0x0A7F) return char;
  return String.fromCodePoint(0x0900 + (code - 0x0A00));
}).join('');

const TranslateBox = ({ onTranslate, onFavorite }) => {
  const { user } = useAuth();
  const { t } = useUIContext();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState(user?.defaultSourceLang || 'en');
  const [targetLang, setTargetLang] = useState(user?.defaultTargetLang || 'hi');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [activeMode, setActiveMode] = useState('text'); // text, speech, ocr, history, favorites
  const [ocrAction, setOcrAction] = useState('translate');
  const [currentTranslationId, setCurrentTranslationId] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [voices, setVoices] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (activeMode === 'history' || activeMode === 'favorites') {
      fetchListData();
    }
  }, [activeMode]);

  const fetchListData = async () => {
    if (!user) {
      toast.error('Please login to see this');
      setActiveMode('text');
      return;
    }
    setListLoading(true);
    try {
      if (activeMode === 'history') {
        const data = await getHistory({ limit: 5 });
        setHistory(data.translations);
      } else {
        const data = await getFavorites({ limit: 5 });
        setFavorites(data.favorites);
      }
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setSourceLang(user.defaultSourceLang || 'en');
      setTargetLang(user.defaultTargetLang || 'hi');
    }
  }, [user]);

  const handleTranslate = async (
    textToTranslate = sourceText,
    sourceLangOverride = sourceLang,
    translationTypeOverride = activeMode
  ) => {
    const text = typeof textToTranslate === 'string' ? textToTranslate : sourceText;
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const data = await translateText({
        sourceText: text,
        sourceLang: sourceLangOverride,
        targetLang,
        translationType: translationTypeOverride
      });
      setTranslatedText(data.translatedText);
      setCurrentTranslationId(data.translationId);

      // Reset favorite status for new translation
      setIsFavorited(false);
      setFavoriteId(null);

      // Notify parent to refresh history
      if (onTranslate) onTranslate();
    } catch (err) {
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransliterate = async (textToTransliterate = sourceText, targetLangOverride = targetLang) => {
    const text = typeof textToTransliterate === 'string' ? textToTransliterate : sourceText;
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await transliterateText(text, targetLangOverride);
      setTranslatedText(res);
      setCurrentTranslationId(null);
      setIsFavorited(false);
      setFavoriteId(null);
    } catch (err) {
      toast.error('Transliteration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const findVoice = (lang) => {
    const preferredLocales = SPEECH_LOCALES[lang] || [lang];
    const availableVoices = voices.length ? voices : window.speechSynthesis.getVoices();

    return preferredLocales
      .map((locale) => availableVoices.find((voice) => voice.lang.toLowerCase() === locale.toLowerCase())
        || availableVoices.find((voice) => voice.lang.toLowerCase().startsWith(locale.toLowerCase())))
      .find(Boolean);
  };

  const speakWithLang = (text, lang) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);

    const preferredLocale = SPEECH_LOCALES[lang]?.[0] || lang;
    const voice = findVoice(lang);

    utterance.lang = voice?.lang || preferredLocale;
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const speak = (text, lang) => {
    if (!text) return;

    if (SERVER_TTS_LANGS.has(lang)) {
      window.speechSynthesis?.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(getTextToSpeechUrl(text, lang));
      audioRef.current = audio;
      audio.onerror = () => {
        const fallbackText = lang === 'pa' ? transliterateGurmukhiToDevanagari(text) : text;
        const fallbackLang = lang === 'pa' ? 'hi' : lang;
        speakWithLang(fallbackText, fallbackLang);
      };
      audio.play().catch(() => {
        const fallbackText = lang === 'pa' ? transliterateGurmukhiToDevanagari(text) : text;
        const fallbackLang = lang === 'pa' ? 'hi' : lang;
        speakWithLang(fallbackText, fallbackLang);
      });
      return;
    }

    if (!window.speechSynthesis) {
      toast.error('Speech is not supported in this browser');
      return;
    }

    speakWithLang(text, lang);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }
    if (!currentTranslationId) return;

    try {
      if (isFavorited) {
        await removeFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
        toast.success('Removed from favorites');
      } else {
        const res = await addFavorite({ translationId: currentTranslationId });
        setIsFavorited(true);
        setFavoriteId(res.favorite._id);
        toast.success('Added to favorites');
      }

      // Notify parent to refresh favorites
      if (onFavorite) onFavorite();
      window.dispatchEvent(new Event('favorites:changed'));
      localStorage.setItem('favoritesUpdatedAt', Date.now().toString());
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-white/50 p-2 rounded-2xl w-fit mx-auto border border-orange-100 shadow-sm">
        {[
          { id: 'text', icon: <Languages size={18} />, label: t('modeText') },
          { id: 'speech', icon: <Mic size={18} />, label: t('modeSpeech') },
          { id: 'ocr', icon: <ImageIcon size={18} />, label: t('modeOCR') },
          { id: 'transliterate', icon: <Type size={18} />, label: t('modeTranslit') },
          { id: 'history', icon: <History size={18} />, label: t('modeHistory') },
          { id: 'favorites', icon: <Star size={18} />, label: t('modeSaved') },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-all ${activeMode === mode.id
                ? 'bg-white text-primary shadow-md font-semibold'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(activeMode === 'history' || activeMode === 'favorites') ? (
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full h-[450px] glass rounded-3xl p-8 overflow-y-auto custom-scrollbar border-2 border-orange-100/30"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 capitalize">
                Your {activeMode === 'history' ? 'Translation History' : 'Saved Translations'}
              </h3>
              <button
                onClick={fetchListData}
                className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition-all active:scale-95"
              >
                Refresh
              </button>
            </div>

            {listLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 size={40} className="text-primary animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
              </div>
            ) : (activeMode === 'history' ? history : favorites).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100">
                  {activeMode === 'history' ? <History size={40} /> : <Star size={40} />}
                </div>
                <p className="font-medium text-lg text-gray-400">No {activeMode} found yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {(activeMode === 'history' ? history : favorites).map((item, idx) => {
                  const data = activeMode === 'history' ? item : item.translationId;
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        setSourceText(data.sourceText);
                        setTranslatedText(data.translatedText);
                        setSourceLang(data.sourceLang);
                        setTargetLang(data.targetLang);
                        setActiveMode('text');
                      }}
                      className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Repeat size={16} className="text-primary" />
                      </div>
                      <div className="flex items-center gap-3 mb-3 text-[10px] font-black uppercase tracking-widest">
                        <span className="bg-orange-50 text-primary px-3 py-1 rounded-full border border-orange-100">{data.sourceLang}</span>
                        <ArrowRight size={14} className="text-gray-300" />
                        <span className="bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full border border-indigo-100">{data.targetLang}</span>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-1 mb-1 font-medium">{data.sourceText}</p>
                      <p className="text-gray-800 font-bold line-clamp-1">{data.translatedText}</p>
                    </motion.div>
                  );
                })}
                <div className="pt-6 border-t border-gray-50 mt-4">
                  <Link to={activeMode === 'history' ? "/history" : "/favorites"} className="flex items-center justify-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                    <span>Manage all {activeMode}</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="translate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source Section */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between px-2">
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer hover:text-primary transition-colors text-lg"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  {activeMode === 'speech' && (
                    <SpeechInput
                      onResult={(text) => { setSourceText(text); }}
                      lang={sourceLang}
                    />
                  )}
                  {activeMode === 'ocr' && (
                    <div className="flex items-center gap-1 bg-white/70 border border-orange-100 rounded-xl p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setOcrAction('translate')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          ocrAction === 'translate'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-500 hover:text-primary'
                        }`}
                      >
                        Translate
                      </button>
                      <button
                        type="button"
                        onClick={() => setOcrAction('transliterate')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          ocrAction === 'transliterate'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-500 hover:text-primary'
                        }`}
                      >
                        Transliterate
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder={activeMode === 'ocr' ? t('placeholderUpload') : t('placeholderPaste')}
                    className="w-full h-72 p-8 text-2xl glass rounded-[2.5rem] border-2 border-transparent focus:border-orange-300 focus:ring-0 resize-none custom-scrollbar transition-all shadow-sm group-hover:shadow-md"
                    readOnly={activeMode === 'ocr'}
                  />
                  {activeMode === 'ocr' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <ImageOCR
                        sourceLang={sourceLang}
                        onTextExtracted={(text, detectedLang) => { 
                          const cleanText = text.replace(/[\r\n]+/g, ' ').trim();
                          const sourceLangForTranslation = detectedLang || sourceLang;
                          setSourceText(cleanText); 
                          setSourceLang(sourceLangForTranslation);
                          if (ocrAction === 'transliterate') {
                            setActiveMode('transliterate');
                            handleTransliterate(cleanText, targetLang);
                          } else {
                            setActiveMode('text'); 
                            handleTranslate(cleanText, sourceLangForTranslation, 'ocr');
                          }
                        }}
                      />
                    </div>
                  )}
                  {sourceText && (
                    <button
                      onClick={() => setSourceText('')}
                      className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors bg-white/50 p-2 rounded-xl backdrop-blur-sm"
                      title="Clear"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Translation Section */}
              <div className="flex flex-col space-y-3 relative">
                {/* Swap Button (Desktop) */}
                <button
                  onClick={handleSwap}
                  className="hidden lg:flex absolute -left-7 top-[50%] -translate-y-[50%] z-10 w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-xl border border-orange-100 text-primary hover:scale-110 active:rotate-180 transition-all duration-500 group"
                >
                  <Repeat size={28} className="group-active:scale-90" />
                </button>

                <div className="flex items-center justify-between px-2">
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer hover:text-primary transition-colors text-lg"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2">
                    {translatedText && (
                      <>
                        <button
                          onClick={() => speak(translatedText, targetLang)}
                          className="p-3 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-xl transition-all"
                          title="Listen"
                        >
                          <Volume2 size={22} />
                        </button>
                        {user && currentTranslationId && (
                          <button
                            onClick={toggleFavorite}
                            className={`p-3 rounded-xl transition-all ${isFavorited ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star size={22} fill={isFavorited ? "currentColor" : "none"} />
                          </button>
                        )}
                        <button
                          onClick={copyToClipboard}
                          className="p-3 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-xl transition-all"
                          title="Copy"
                        >
                          {copied ? <Check size={22} className="text-green-500" /> : <Copy size={22} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <div className={`w-full h-72 p-8 text-2xl glass rounded-[2.5rem] border-2 border-transparent transition-all shadow-sm group-hover:shadow-md overflow-y-auto custom-scrollbar ${!translatedText && 'text-gray-400 italic font-light'}`}>
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <Loader2 size={48} className="text-primary animate-spin" />
                        <p className="text-sm font-bold text-gray-400 animate-pulse tracking-widest uppercase">{t('loading')}</p>
                      </div>
                    ) : (
                      translatedText || t('outputPlaceholder')
                    )}
                  </div>
                </div>
              </div>
            </div>

            {activeMode !== 'history' && activeMode !== 'favorites' && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={activeMode === 'transliterate' ? handleTransliterate : handleTranslate}
                  disabled={isLoading || !sourceText.trim()}
                  className={`flex items-center space-x-4 px-16 py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl active:scale-95 ${isLoading || !sourceText.trim()
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                      : 'orange-gradient text-white hover:shadow-orange-200 hover:shadow-2xl hover:-translate-y-1'
                    }`}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={28} />
                  ) : (
                    <>
                      <span>{activeMode === 'transliterate' ? t('btnTransliterate') : t('btnTranslate')}</span>
                      {activeMode === 'transliterate' ? <Type size={28} /> : <Languages size={28} />}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TranslateBox;
