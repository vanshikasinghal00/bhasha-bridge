import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const useUIContext = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [uiLang, setUiLang] = useState('en');

  const t = (key) => {
    return translations[uiLang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ uiLang, setUiLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
