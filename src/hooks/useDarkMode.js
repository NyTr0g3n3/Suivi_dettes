import { useState, useEffect } from 'react';

let hookInstanceCount = 0;

export const useDarkMode = () => {
  const instanceId = ++hookInstanceCount;
  console.log(`🔵 useDarkMode hook instance #${instanceId} created`);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    console.log(`[Instance ${instanceId}] Initial darkMode from localStorage:`, saved);
    if (saved !== null) {
      return saved === 'true';
    }
    // Par défaut, mode sombre
    return true;
  });

  useEffect(() => {
    console.log(`[Instance ${instanceId}] Dark mode changed to:`, isDarkMode);
    console.trace('Stack trace for dark mode change:');
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      console.log(`[Instance ${instanceId}] Added dark class to root`);
    } else {
      root.classList.remove('dark');
      console.log(`[Instance ${instanceId}] Removed dark class from root`);
    }

    localStorage.setItem('darkMode', String(isDarkMode));
    console.log(`[Instance ${instanceId}] Saved to localStorage:`, String(isDarkMode));
  }, [isDarkMode, instanceId]);

  const toggleDarkMode = () => {
    console.log(`[Instance ${instanceId}] Toggle dark mode called, current:`, isDarkMode);
    setIsDarkMode(prev => {
      console.log(`[Instance ${instanceId}] setIsDarkMode: ${prev} → ${!prev}`);
      return !prev;
    });
  };

  return { isDarkMode, toggleDarkMode };
};
