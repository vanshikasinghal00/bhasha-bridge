import React from 'react';
import TranslateBox from '../components/TranslateBox';
import RecentActivity from '../components/RecentActivity';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { useState } from 'react';
import { useUIContext } from '../context/LanguageContext';

const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { t } = useUIContext();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  return (
    <div className="min-h-screen pt-12 pb-20 px-4">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="px-5 py-2 rounded-full glass border border-white/10 text-indigo-400 text-sm font-semibold uppercase tracking-widest shadow-xl">
            {t('heroBadge')}
          </span>
          <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tight leading-tight">
            {t('heroTitle1')}
            {t('heroTitle2') && (
              <>
                <br />
                <span className="secondary-gradient bg-clip-text text-transparent">{t('heroTitle2')}</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-2xl md:text-3xl font-black secondary-gradient bg-clip-text text-transparent">
            {t('heroSubtitle')}
          </p>
          <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>
        </motion.div>
      </div>

      {/* Main Translation Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="max-w-5xl mx-auto relative group"
      >
        <div className="absolute -inset-1 primary-gradient rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative">
          <TranslateBox onTranslate={handleRefresh} onFavorite={handleRefresh} />
        </div>
      </motion.div>

      {/* Recent Activity Section */}
      <div className="max-w-5xl mx-auto px-4">
        <RecentActivity refreshTrigger={refreshTrigger} />
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <Globe className="text-indigo-400" />, title: t('feat1Title'), desc: t('feat1Desc') },
          { icon: <Zap className="text-pink-400" />, title: t('feat2Title'), desc: t('feat2Desc') },
          { icon: <Shield className="text-cyan-400" />, title: t('feat3Title'), desc: t('feat3Desc') },
          { icon: <Sparkles className="text-violet-400" />, title: t('feat4Title'), desc: t('feat4Desc') },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 glass-card rounded-3xl flex flex-col items-center text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-2xl glass border border-white/5 flex items-center justify-center text-2xl shadow-inner">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
