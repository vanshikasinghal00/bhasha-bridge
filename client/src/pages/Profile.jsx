import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, Loader2, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUIContext } from '../context/LanguageContext';

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

const Profile = () => {
  const { user, updatePreferences } = useAuth();
  const { t } = useUIContext();
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    defaultSourceLang: user?.defaultSourceLang || 'en',
    defaultTargetLang: user?.defaultTargetLang || 'hi',
    theme: user?.theme || 'light'
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mb-4">
          <User size={40} />
        </div>
<h3 className="text-xl font-bold text-gray-700 mb-2">{t('pleaseLoginProfile')}</h3>
        <Link to="/login" className="orange-gradient text-white px-6 py-3 rounded-xl font-bold mt-2">
          {t('goToLogin')}
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const success = await updatePreferences(prefs);
if (success) toast.success(t('profileSaved'));
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-medium mb-6 transition-colors">
<ArrowLeft size={18} />
        {t('profileBack')}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Account Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
<User className="text-primary" size={24} />
            {t('accountInfo')}
          </h3>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl orange-gradient text-white flex items-center justify-center text-2xl font-black shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{user.name}</p>
<p className="text-sm text-gray-500">{t('memberSince')} {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Email</p>
                    <p className="font-medium text-gray-700">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
<Settings className="text-primary" size={24} />
            {t('translationPreferences')}
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
<label className="text-sm font-bold text-gray-500">{t('defaultSourceLanguage')}</label>
              <select
                value={prefs.defaultSourceLang}
                onChange={(e) => setPrefs({ ...prefs, defaultSourceLang: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
<label className="text-sm font-bold text-gray-500">{t('defaultTargetLanguage')}</label>
              <select
                value={prefs.defaultTargetLang}
                onChange={(e) => setPrefs({ ...prefs, defaultTargetLang: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
<label className="text-sm font-bold text-gray-500">{t('themeLabel')}</label>
              <div className="flex gap-3">
{['light', 'dark'].map(theme => (
                  <button
                    key={theme}
                    onClick={() => setPrefs({ ...prefs, theme })}
                    className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${
                      prefs.theme === theme
                        ? 'orange-gradient text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {theme === 'light' ? t('themeLight') : t('themeDark')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full orange-gradient text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
<span>{saving ? t('saving') : t('savePreferences')}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
