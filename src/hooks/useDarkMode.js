import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    console.log('Initial darkMode from localStorage:', saved);
    if (saved !== null) {
      return saved === 'true';
    }
    // Par défaut, mode sombre
    return true;
  });

  useEffect(() => {
    console.log('Dark mode changed to:', isDarkMode);
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      console.log('Added dark class to root');
    } else {
      root.classList.remove('dark');
      console.log('Removed dark class from root');
    }

    localStorage.setItem('darkMode', String(isDarkMode));
    console.log('Saved to localStorage:', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    console.log('Toggle dark mode called, current:', isDarkMode);
    setIsDarkMode(prev => !prev);
  };

  return { isDarkMode, toggleDarkMode };
};
