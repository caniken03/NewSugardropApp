import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
}

const darkTheme: ThemeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#0c0c0c',
  surface: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  border: '#27272a',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextType>({
  colors: darkTheme,
  isDark: true,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider
      value={{
        colors: darkTheme,
        isDark: true,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}