import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 p-3 rounded-xl
                 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
                 hover:bg-white dark:hover:bg-gray-800
                 shadow-lg hover:shadow-xl
                 transition-all duration-200 group"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
      )}
    </button>
  );
};