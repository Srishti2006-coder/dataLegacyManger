import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, saveUserSettings } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Load from localStorage + user settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setLoading(false);
  }, []);

  // Listen to user settings changes for theme sync
  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.settings?.theme) {
          const savedTheme = data.settings.theme;
          setTheme(savedTheme);
          localStorage.setItem('theme', savedTheme);
        }
      }
    });
    return unsubscribe;
  }, [auth.currentUser]);

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Save to Firestore (Phase 4)
    if (auth.currentUser) {
      try {
        // Get current settings and update theme
        await saveUserSettings({ theme: newTheme /* full settings object */ });
      } catch (error) {
        console.error('Theme save failed:', error);
      }
    }
  };

  const value = {
    theme,
    toggleTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};

