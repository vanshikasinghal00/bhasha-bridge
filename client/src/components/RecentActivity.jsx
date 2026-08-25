import React, { useState, useEffect } from 'react';
import { getHistory, getFavorites } from '../api';
import { Clock, Star, ArrowRight, Languages, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const RecentActivity = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [favoriteSearch, setFavoriteSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchRecentData();
    }
  }, [user, refreshTrigger]);

  const fetchRecentData = async () => {
    try {
      const [historyData, favoritesData] = await Promise.all([
        getHistory({ limit: 4 }),
        getFavorites({ limit: 4 })
      ]);
      setHistory(historyData.translations);
      setFavorites(favoritesData.favorites);
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Recent History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="text-indigo-400" size={20} />
            History
          </h3>
          <Link to="/history" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
        </div>

        <div className="px-2">
          <input 
            type="text" 
            placeholder="Search recent history..." 
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-400 transition-all"
          />
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-indigo-400" /></div>
          ) : history.filter(h => h.sourceText.toLowerCase().includes(historySearch.toLowerCase()) || h.translatedText.toLowerCase().includes(historySearch.toLowerCase())).length > 0 ? (
            history.filter(h => h.sourceText.toLowerCase().includes(historySearch.toLowerCase()) || h.translatedText.toLowerCase().includes(historySearch.toLowerCase())).map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 glass-card rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="bg-white/5 px-2 py-0.5 rounded text-indigo-300">{item.sourceLang}</span>
                  <ArrowRight size={10} />
                  <span className="bg-white/5 px-2 py-0.5 rounded text-pink-300">{item.targetLang}</span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-1">{item.sourceText}</p>
                <p className="text-sm text-white font-medium line-clamp-1 mt-1">{item.translatedText}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-center py-8 text-slate-500 italic text-sm">No history yet</p>
          )}
        </div>
      </div>

      {/* Recent Favorites */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="text-yellow-400" size={20} />
            Favorites
          </h3>
          <Link to="/favorites" className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">View All</Link>
        </div>

        <div className="px-2">
          <input 
            type="text" 
            placeholder="Search recent favorites..." 
            value={favoriteSearch}
            onChange={(e) => setFavoriteSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-yellow-400 transition-all"
          />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-yellow-400" /></div>
          ) : favorites.filter(f => f.translationId.sourceText.toLowerCase().includes(favoriteSearch.toLowerCase()) || f.translationId.translatedText.toLowerCase().includes(favoriteSearch.toLowerCase())).length > 0 ? (
            favorites.filter(f => f.translationId.sourceText.toLowerCase().includes(favoriteSearch.toLowerCase()) || f.translationId.translatedText.toLowerCase().includes(favoriteSearch.toLowerCase())).map((fav, i) => (
              <motion.div
                key={fav._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 glass-card rounded-2xl border border-white/5 hover:border-yellow-400/20 transition-all hover:translate-x--1"
              >
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="bg-white/5 px-2 py-0.5 rounded text-indigo-300">{fav.translationId.sourceLang}</span>
                  <ArrowRight size={10} />
                  <span className="bg-white/5 px-2 py-0.5 rounded text-pink-300">{fav.translationId.targetLang}</span>
                  <Star size={10} className="ml-auto text-yellow-400" fill="currentColor" />
                </div>
                <p className="text-sm text-slate-300 line-clamp-1">{fav.translationId.sourceText}</p>
                <p className="text-sm text-white font-medium line-clamp-1 mt-1">{fav.translationId.translatedText}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-center py-8 text-slate-500 italic text-sm">No favorites yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
