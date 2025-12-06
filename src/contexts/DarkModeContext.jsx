import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  console.log('🟢 DarkModeProvider initialized');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    console.log('📦 Initial state from localStorage:', saved);
    if (saved !== null) {
      return saved === 'true';
    }
    return true; // Default dark mode
  });

  useEffect(() => {
    console.log('🔄 Dark mode changed to:', isDarkMode);
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      console.log('✅ Added dark class');
    } else {
      root.classList.remove('dark');
      console.log('✅ Removed dark class');
    }

    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    console.log('🔘 toggleDarkMode called! Current:', isDarkMode);
    setIsDarkMode(prev => {
      console.log('🔀 Toggling from', prev, 'to', !prev);
      return !prev;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};
