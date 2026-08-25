import React, { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '../api';
import { Star, Trash2, Languages, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data.favorites);
    } catch (err) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeFavorite(id);
      setFavorites(favorites.filter(f => f._id !== id));
      window.dispatchEvent(new Event('favorites:changed'));
      localStorage.setItem('favoritesUpdatedAt', Date.now().toString());
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 text-center md:text-left">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-3">
          <Star className="text-yellow-500 fill-yellow-500" size={36} />
          Your Favorites
        </h1>
        <p className="text-gray-500 mt-1">Bookmarked translations for quick access</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 size={48} className="text-primary animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 glass rounded-3xl border-dashed border-2 border-gray-200">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-400 mb-4">
            <Star size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-700">No favorites yet</h3>
          <p className="text-gray-500 mt-2">Click the star icon on any translation to save it here!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode='popLayout'>
            {favorites.map((fav, index) => (
              <motion.div
                key={fav._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-24 h-24 orange-gradient opacity-10 rounded-bl-[100px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary">
                      <span>{fav.translationId?.sourceLang}</span>
                      <ArrowRight size={14} />
                      <span className="text-secondary">{fav.translationId?.targetLang}</span>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-2">Source</h4>
                      <p className="text-lg text-gray-700 leading-relaxed">{fav.translationId?.sourceText}</p>
                    </div>

                    <div className="border-t border-gray-50 pt-4">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-tighter mb-2">Translation</h4>
                      <p className="text-xl font-bold text-gray-900 leading-relaxed">{fav.translationId?.translatedText}</p>
                    </div>

                    {fav.note && (
                      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3">
                        <MessageSquare size={18} className="text-primary mt-1 shrink-0" />
                        <p className="text-sm text-gray-600 italic">"{fav.note}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col justify-end gap-2">
                    <button
                      onClick={() => handleRemove(fav._id)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Remove from favorites"
                    >
                      <Trash2 size={24} />
                    </button>
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(fav.translationId?.translatedText);
                        window.speechSynthesis.speak(utterance);
                      }}
                      className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                      title="Listen"
                    >
                      <Languages size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Favorites;
