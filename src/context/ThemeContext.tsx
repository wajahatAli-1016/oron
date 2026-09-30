import React, { createContext, useContext } from 'react';

type Theme = 'light';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // Keep as empty function to avoid breaking existing code
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Force theme to always be 'light'
  const theme: Theme = 'light';
  
  // Remove dark class if it exists
  const root = window.document.documentElement;
  root.classList.remove('dark');
  
  // Clear localStorage theme
  localStorage.removeItem('oron_theme');

  // Empty function that does nothing (prevents errors if called)
  const toggleTheme = () => {
    // Theme toggle disabled - light theme only
    console.log('Theme switching is disabled - light theme only');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};