import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUIContext } from '../context/LanguageContext';
import { getFavorites, getStats } from '../api';
import { LayoutDashboard, Languages, Zap, Clock, Star, Settings, Save, Loader2 } from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DASHBOARD_COPY = {
  en: {
    greeting: 'Hello, {name}!',
    welcome: 'Welcome to your BhashaBridge dashboard',
    totalTranslations: 'Total Translations',
    savedFavorites: 'Saved Favorites',
    mostUsedLang: 'Most Used Lang',
    languageUsage: 'Language Usage Distribution',
    noData: 'No data yet',
    activityType: 'Activity Type',
    quickSettings: 'Quick Settings',
    defaultSourceLanguage: 'Default Source Language',
    defaultTargetLanguage: 'Default Target Language',
    savePreferences: 'Save Preferences',
    preferencesSaved: 'Preferences saved',
    failedStats: 'Failed to load stats',
    notAvailable: 'N/A',
  },
  hi: {
    greeting: 'नमस्ते, {name}!',
    welcome: 'आपके भाषाBridge डैशबोर्ड में आपका स्वागत है',
    totalTranslations: 'कुल अनुवाद',
    savedFavorites: 'सहेजे गए पसंदीदा',
    mostUsedLang: 'सबसे अधिक उपयोग की गई भाषा',
    languageUsage: 'भाषा उपयोग वितरण',
    noData: 'अभी कोई डेटा नहीं',
    activityType: 'गतिविधि प्रकार',
    quickSettings: 'त्वरित सेटिंग्स',
    defaultSourceLanguage: 'डिफ़ॉल्ट स्रोत भाषा',
    defaultTargetLanguage: 'डिफ़ॉल्ट लक्ष्य भाषा',
    savePreferences: 'प्राथमिकताएँ सहेजें',
    preferencesSaved: 'प्राथमिकताएँ सहेजी गईं',
    failedStats: 'आँकड़े लोड नहीं हो सके',
    notAvailable: 'लागू नहीं',
  },
  bn: {
    greeting: 'নমস্কার, {name}!',
    welcome: 'আপনার BhashaBridge ড্যাশবোর্ডে স্বাগতম',
    totalTranslations: 'মোট অনুবাদ',
    savedFavorites: 'সংরক্ষিত প্রিয়',
    mostUsedLang: 'সর্বাধিক ব্যবহৃত ভাষা',
    languageUsage: 'ভাষা ব্যবহারের বণ্টন',
    noData: 'এখনও কোনও ডেটা নেই',
    activityType: 'কার্যকলাপের ধরন',
    quickSettings: 'দ্রুত সেটিংস',
    defaultSourceLanguage: 'ডিফল্ট উৎস ভাষা',
    defaultTargetLanguage: 'ডিফল্ট লক্ষ্য ভাষা',
    savePreferences: 'পছন্দ সংরক্ষণ করুন',
    preferencesSaved: 'পছন্দ সংরক্ষিত হয়েছে',
    failedStats: 'পরিসংখ্যান লোড করা যায়নি',
    notAvailable: 'প্রযোজ্য নয়',
  },
  ta: {
    greeting: 'வணக்கம், {name}!',
    welcome: 'உங்கள் BhashaBridge டாஷ்போர்டுக்கு வரவேற்கிறோம்',
    totalTranslations: 'மொத்த மொழிபெயர்ப்புகள்',
    savedFavorites: 'சேமித்த விருப்பங்கள்',
    mostUsedLang: 'அதிகம் பயன்படுத்திய மொழி',
    languageUsage: 'மொழி பயன்பாட்டு விநியோகம்',
    noData: 'இன்னும் தரவு இல்லை',
    activityType: 'செயல்பாட்டு வகை',
    quickSettings: 'விரைவு அமைப்புகள்',
    defaultSourceLanguage: 'இயல்புநிலை மூல மொழி',
    defaultTargetLanguage: 'இயல்புநிலை இலக்கு மொழி',
    savePreferences: 'விருப்பங்களை சேமிக்கவும்',
    preferencesSaved: 'விருப்பங்கள் சேமிக்கப்பட்டன',
    failedStats: 'புள்ளிவிவரங்களை ஏற்ற முடியவில்லை',
    notAvailable: 'இல்லை',
  },
  te: {
    greeting: 'నమస్కారం, {name}!',
    welcome: 'మీ BhashaBridge డ్యాష్‌బోర్డ్‌కు స్వాగతం',
    totalTranslations: 'మొత్తం అనువాదాలు',
    savedFavorites: 'సేవ్ చేసిన ఇష్టాలు',
    mostUsedLang: 'ఎక్కువగా వాడిన భాష',
    languageUsage: 'భాష వినియోగ పంపిణీ',
    noData: 'ఇంకా డేటా లేదు',
    activityType: 'కార్యాచరణ రకం',
    quickSettings: 'త్వరిత సెట్టింగులు',
    defaultSourceLanguage: 'డిఫాల్ట్ మూల భాష',
    defaultTargetLanguage: 'డిఫాల్ట్ లక్ష్య భాష',
    savePreferences: 'ప్రాధాన్యతలు సేవ్ చేయండి',
    preferencesSaved: 'ప్రాధాన్యతలు సేవ్ అయ్యాయి',
    failedStats: 'గణాంకాలు లోడ్ కాలేదు',
    notAvailable: 'వర్తించదు',
  },
  mr: {
    greeting: 'नमस्कार, {name}!',
    welcome: 'तुमच्या BhashaBridge डॅशबोर्डवर स्वागत आहे',
    totalTranslations: 'एकूण अनुवाद',
    savedFavorites: 'जतन केलेले आवडते',
    mostUsedLang: 'सर्वाधिक वापरलेली भाषा',
    languageUsage: 'भाषा वापर वितरण',
    noData: 'अजून डेटा नाही',
    activityType: 'क्रियाकलाप प्रकार',
    quickSettings: 'जलद सेटिंग्ज',
    defaultSourceLanguage: 'डीफॉल्ट स्रोत भाषा',
    defaultTargetLanguage: 'डीफॉल्ट लक्ष्य भाषा',
    savePreferences: 'प्राधान्ये जतन करा',
    preferencesSaved: 'प्राधान्ये जतन झाली',
    failedStats: 'आकडेवारी लोड झाली नाही',
    notAvailable: 'लागू नाही',
  },
  gu: {
    greeting: 'નમસ્તે, {name}!',
    welcome: 'તમારા BhashaBridge ડેશબોર્ડમાં સ્વાગત છે',
    totalTranslations: 'કુલ અનુવાદ',
    savedFavorites: 'સાચવેલા મનપસંદ',
    mostUsedLang: 'સૌથી વધુ વપરાયેલી ભાષા',
    languageUsage: 'ભાષા ઉપયોગ વિતરણ',
    noData: 'હજુ કોઈ ડેટા નથી',
    activityType: 'પ્રવૃત્તિ પ્રકાર',
    quickSettings: 'ઝડપી સેટિંગ્સ',
    defaultSourceLanguage: 'ડિફોલ્ટ સ્ત્રોત ભાષા',
    defaultTargetLanguage: 'ડિફોલ્ટ લક્ષ્ય ભાષા',
    savePreferences: 'પસંદગીઓ સાચવો',
    preferencesSaved: 'પસંદગીઓ સાચવાઈ',
    failedStats: 'આંકડા લોડ થઈ શક્યા નથી',
    notAvailable: 'લાગુ નથી',
  },
  pa: {
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, {name}!',
    welcome: 'ਤੁਹਾਡੇ BhashaBridge ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਸੁਆਗਤ ਹੈ',
    totalTranslations: 'ਕੁੱਲ ਅਨੁਵਾਦ',
    savedFavorites: 'ਸੇਵ ਕੀਤੇ ਮਨਪਸੰਦ',
    mostUsedLang: 'ਸਭ ਤੋਂ ਵੱਧ ਵਰਤੀ ਭਾਸ਼ਾ',
    languageUsage: 'ਭਾਸ਼ਾ ਵਰਤੋਂ ਵੰਡ',
    noData: 'ਹਾਲੇ ਕੋਈ ਡੇਟਾ ਨਹੀਂ',
    activityType: 'ਗਤੀਵਿਧੀ ਕਿਸਮ',
    quickSettings: 'ਤੁਰੰਤ ਸੈਟਿੰਗਾਂ',
    defaultSourceLanguage: 'ਡਿਫਾਲਟ ਸਰੋਤ ਭਾਸ਼ਾ',
    defaultTargetLanguage: 'ਡਿਫਾਲਟ ਲਕਸ਼ ਭਾਸ਼ਾ',
    savePreferences: 'ਪਸੰਦਾਂ ਸੇਵ ਕਰੋ',
    preferencesSaved: 'ਪਸੰਦਾਂ ਸੇਵ ਹੋ ਗਈਆਂ',
    failedStats: 'ਅੰਕੜੇ ਲੋਡ ਨਹੀਂ ਹੋਏ',
    notAvailable: 'ਲਾਗੂ ਨਹੀਂ',
  },
  kn: {
    greeting: 'ನಮಸ್ಕಾರ, {name}!',
    welcome: 'ನಿಮ್ಮ BhashaBridge ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ',
    totalTranslations: 'ಒಟ್ಟು ಅನುವಾದಗಳು',
    savedFavorites: 'ಉಳಿಸಿದ ಮೆಚ್ಚಿನವುಗಳು',
    mostUsedLang: 'ಹೆಚ್ಚು ಬಳಸಿದ ಭಾಷೆ',
    languageUsage: 'ಭಾಷಾ ಬಳಕೆ ವಿತರಣೆ',
    noData: 'ಇನ್ನೂ ಡೇಟಾ ಇಲ್ಲ',
    activityType: 'ಚಟುವಟಿಕೆ ಪ್ರಕಾರ',
    quickSettings: 'ತ್ವರಿತ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    defaultSourceLanguage: 'ಡೀಫಾಲ್ಟ್ ಮೂಲ ಭಾಷೆ',
    defaultTargetLanguage: 'ಡೀಫಾಲ್ಟ್ ಗುರಿ ಭಾಷೆ',
    savePreferences: 'ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ',
    preferencesSaved: 'ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ',
    failedStats: 'ಅಂಕಿಅಂಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ',
    notAvailable: 'ಅನ್ವಯಿಸುವುದಿಲ್ಲ',
  },
  ml: {
    greeting: 'നമസ്കാരം, {name}!',
    welcome: 'നിങ്ങളുടെ BhashaBridge ഡാഷ്ബോർഡിലേക്ക് സ്വാഗതം',
    totalTranslations: 'ആകെ വിവർത്തനങ്ങൾ',
    savedFavorites: 'സംരക്ഷിച്ച പ്രിയപ്പെട്ടവ',
    mostUsedLang: 'ഏറ്റവും ഉപയോഗിച്ച ഭാഷ',
    languageUsage: 'ഭാഷാ ഉപയോഗ വിതരണം',
    noData: 'ഇനിയും ഡാറ്റയില്ല',
    activityType: 'പ്രവർത്തന തരം',
    quickSettings: 'വേഗത്തിലുള്ള ക്രമീകരണങ്ങൾ',
    defaultSourceLanguage: 'സ്ഥിരസ്ഥിതി ഉറവിട ഭാഷ',
    defaultTargetLanguage: 'സ്ഥിരസ്ഥിതി ലക്ഷ്യ ഭാഷ',
    savePreferences: 'മുൻഗണനകൾ സംരക്ഷിക്കുക',
    preferencesSaved: 'മുൻഗണനകൾ സംരക്ഷിച്ചു',
    failedStats: 'സ്ഥിതിവിവരക്കണക്കുകൾ ലോഡ് ചെയ്യാനായില്ല',
    notAvailable: 'ബാധകമല്ല',
  },
  or: {
    greeting: 'ନମସ୍କାର, {name}!',
    welcome: 'ଆପଣଙ୍କ BhashaBridge ଡ୍ୟାସବୋର୍ଡକୁ ସ୍ୱାଗତ',
    totalTranslations: 'ମୋଟ ଅନୁବାଦ',
    savedFavorites: 'ସଂରକ୍ଷିତ ପ୍ରିୟ',
    mostUsedLang: 'ସର୍ବାଧିକ ବ୍ୟବହୃତ ଭାଷା',
    languageUsage: 'ଭାଷା ବ୍ୟବହାର ବଣ୍ଟନ',
    noData: 'ଏପର୍ଯ୍ୟନ୍ତ ତଥ୍ୟ ନାହିଁ',
    activityType: 'କାର୍ଯ୍ୟକଳାପ ପ୍ରକାର',
    quickSettings: 'ଦ୍ରୁତ ସେଟିଂସ୍',
    defaultSourceLanguage: 'ଡିଫଲ୍ଟ ଉତ୍ସ ଭାଷା',
    defaultTargetLanguage: 'ଡିଫଲ୍ଟ ଲକ୍ଷ୍ୟ ଭାଷା',
    savePreferences: 'ପସନ୍ଦ ସଂରକ୍ଷଣ କରନ୍ତୁ',
    preferencesSaved: 'ପସନ୍ଦ ସଂରକ୍ଷିତ ହେଲା',
    failedStats: 'ପରିସଂଖ୍ୟାନ ଲୋଡ୍ ହେଲା ନାହିଁ',
    notAvailable: 'ପ୍ରଯୁଜ୍ୟ ନୁହେଁ',
  },
  ur: {
    greeting: 'سلام، {name}!',
    welcome: 'آپ کے BhashaBridge ڈیش بورڈ میں خوش آمدید',
    totalTranslations: 'کل تراجم',
    savedFavorites: 'محفوظ پسندیدہ',
    mostUsedLang: 'سب سے زیادہ استعمال شدہ زبان',
    languageUsage: 'زبان کے استعمال کی تقسیم',
    noData: 'ابھی کوئی ڈیٹا نہیں',
    activityType: 'سرگرمی کی قسم',
    quickSettings: 'فوری ترتیبات',
    defaultSourceLanguage: 'ڈیفالٹ ماخذ زبان',
    defaultTargetLanguage: 'ڈیفالٹ ہدف زبان',
    savePreferences: 'ترجیحات محفوظ کریں',
    preferencesSaved: 'ترجیحات محفوظ ہو گئیں',
    failedStats: 'اعدادوشمار لوڈ نہیں ہو سکے',
    notAvailable: 'دستیاب نہیں',
  },
};

const Dashboard = () => {
  const { user, updatePreferences } = useAuth();
  const { uiLang, t } = useUIContext();
  const copy = DASHBOARD_COPY[uiLang] || DASHBOARD_COPY.en;
  const dt = useCallback((key, replacements = {}) => {
    const template = copy[key] || DASHBOARD_COPY.en[key] || key;
    return Object.entries(replacements).reduce(
      (text, [name, value]) => text.replace(`{${name}}`, value),
      template
    );
  }, [copy]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    defaultSourceLang: user?.defaultSourceLang || 'en',
    defaultTargetLang: user?.defaultTargetLang || 'hi',
    theme: user?.theme || 'light'
  });

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

  const getActivityLabel = (type) => {
    const labels = {
      text: t('modeText'),
      ocr: t('modeOCR'),
      speech: t('modeSpeech'),
      transliterate: t('modeTranslit'),
    };

    return labels[type] || type;
  };

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, favoritesData] = await Promise.all([
        getStats(),
        getFavorites({ page: 1, limit: 1 })
      ]);

      setStats({
        ...statsData,
        totalFavorites: favoritesData.pagination?.total ?? favoritesData.favorites?.length ?? 0
      });
    } catch (err) {
      toast.error(dt('failedStats'));
    } finally {
      setLoading(false);
    }
  }, [dt]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (!document.hidden) fetchStats();
    };

    const refreshFromStorage = (event) => {
      if (event.key === 'favoritesUpdatedAt') fetchStats();
    };

    window.addEventListener('favorites:changed', fetchStats);
    window.addEventListener('focus', fetchStats);
    window.addEventListener('storage', refreshFromStorage);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.removeEventListener('favorites:changed', fetchStats);
      window.removeEventListener('focus', fetchStats);
      window.removeEventListener('storage', refreshFromStorage);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [fetchStats]);

  const handleUpdatePrefs = async () => {
    const success = await updatePreferences(prefs);
    if (success) toast.success(dt('preferencesSaved'));
  };

  const pieData = stats ? {
    labels: stats.targetLangStats.map(s => s._id.toUpperCase()),
    datasets: [{
      data: stats.targetLangStats.map(s => s.count),
      backgroundColor: ['#FF671F', '#046A38', '#06038D', '#FFB81C', '#E63946', '#2A9D8F'],
      borderWidth: 0,
    }]
  } : null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-2xl orange-gradient flex items-center justify-center text-white shadow-lg">
          <LayoutDashboard size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            {dt('greeting', { name: user?.name.split(' ')[0] || '' })}
          </h1>
          <p className="text-gray-500">{dt('welcome')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 size={48} className="text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: dt('totalTranslations'), value: stats?.totalTranslations || 0, icon: <Languages />, color: 'bg-orange-50 text-orange-600' },
              { label: dt('savedFavorites'), value: stats?.totalFavorites || 0, icon: <Star />, color: 'bg-yellow-50 text-yellow-600' },
              { label: dt('mostUsedLang'), value: stats?.targetLangStats[0]?._id.toUpperCase() || dt('notAvailable'), icon: <Zap />, color: 'bg-green-50 text-green-600' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-2"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-black text-gray-800">{card.value}</p>
                <p className="text-sm font-medium text-gray-400">{card.label}</p>
              </motion.div>
            ))}

            {/* Charts */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="text-primary" size={20} />
                {dt('languageUsage')}
              </h3>
              {pieData ? (
                <div className="h-64 flex justify-center">
                  <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">{dt('noData')}</div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} />
                {dt('activityType')}
              </h3>
              <div className="space-y-4">
                {stats?.typeStats.map(type => (
                  <div key={type._id} className="space-y-1">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{getActivityLabel(type._id)}</span>
                      <span>{type.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${(type.count / stats.totalTranslations) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Preferences Settings */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="text-primary" size={24} />
                <h3 className="text-xl font-bold">{dt('quickSettings')}</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">{dt('defaultSourceLanguage')}</label>
                  <select
                    value={prefs.defaultSourceLang}
                    onChange={(e) => setPrefs({...prefs, defaultSourceLang: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">{dt('defaultTargetLanguage')}</label>
                  <select
                    value={prefs.defaultTargetLang}
                    onChange={(e) => setPrefs({...prefs, defaultTargetLang: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleUpdatePrefs}
                  className="w-full orange-gradient text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
                >
                  <Save size={20} />
                  <span>{dt('savePreferences')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
