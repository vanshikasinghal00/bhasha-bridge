import React, { useState, useEffect } from 'react';
import { getHistory, deleteHistoryItem } from '../api';
import { Search, Trash2, Calendar, Languages, ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const History = () => {
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterLang, setFilterLang] = useState('');

  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
  ];

  useEffect(() => {
    fetchHistory();
  }, [page, filterLang]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory({ 
        page, 
        limit: 10, 
        search: searchTerm,
        sourceLang: filterLang 
      });
      setTranslations(data.translations);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this translation?')) return;
    try {
      await deleteHistoryItem(id);
      setTranslations(translations.filter(t => t._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Translation History</h1>
          <p className="text-gray-500 mt-1">Manage and revisit your past translations</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchHistory()}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <select 
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="p-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Langs</option>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 size={48} className="text-primary animate-spin" />
          <p className="text-gray-500 font-medium">Loading history...</p>
        </div>
      ) : translations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 glass rounded-3xl border-dashed border-2 border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Languages size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-700">No history found</h3>
          <p className="text-gray-500 mt-2">Start translating to build your history!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode='popLayout'>
            {translations.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group glass rounded-2xl p-6 hover:shadow-lg transition-all border border-transparent hover:border-orange-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">
                    <span className="bg-orange-100 px-2 py-1 rounded">{item.sourceLang}</span>
                    <ArrowRight size={14} />
                    <span className="bg-blue-100 text-blue-500 px-2 py-1 rounded">{item.targetLang}</span>
                    <span className="flex items-center ml-4 text-gray-400 normal-case font-medium">
                      <Calendar size={14} className="mr-1" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-400 mb-1">Source Text</p>
                    <p className="text-gray-700 line-clamp-3">{item.sourceText}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">Translated Text</p>
                    <p className="text-gray-800 font-medium line-clamp-3">{item.translatedText}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="font-bold text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
