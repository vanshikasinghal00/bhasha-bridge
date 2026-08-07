import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Languages, History, Star, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIContext } from '../context/LanguageContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const { uiLang, setUiLang, t } = useUIContext();

  const navLinks = [
    { name: t('navTranslate'), path: '/', icon: <Languages size={20} /> },
    { name: t('navHistory'), path: '/history', icon: <History size={20} />, protected: true },
    { name: t('navFavorites'), path: '/favorites', icon: <Star size={20} />, protected: true },
    { name: t('navDashboard'), path: '/dashboard', icon: <LayoutDashboard size={20} />, protected: true },
  ];

  const filteredLinks = navLinks.filter(link => !link.protected || user);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 orange-gradient rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Languages size={24} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                {t('brandName')}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'text-primary bg-orange-50'
                    : 'text-gray-600 hover:text-primary hover:bg-orange-50'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center">
              <select
                value={uiLang}
                onChange={(e) => setUiLang(e.target.value)}
                className="bg-orange-50 border border-orange-200 text-primary font-semibold text-sm rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-orange-100 transition-colors"
                title="Change UI Language"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="mr">मराठी</option>
                <option value="gu">ગુજરાતી</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="or">ଓଡ଼ିଆ</option>
                <option value="ur">اردو</option>
              </select>
            </div>

            {user ? (
              <div className="flex items-center ml-4 pl-4 border-l border-gray-200 space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-full pr-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title={t('navLogout')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary font-semibold hover:bg-orange-50 rounded-lg transition-all"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 orange-gradient text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  {t('navSignUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-primary transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-orange-100 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium ${
                    location.pathname === link.path
                      ? 'text-primary bg-orange-50'
                      : 'text-gray-600'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              {!user ? (
                <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2 p-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 text-primary font-semibold border border-primary rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 orange-gradient text-white font-semibold rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => { logout(); setIsOpen(false); navigate('/login'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
