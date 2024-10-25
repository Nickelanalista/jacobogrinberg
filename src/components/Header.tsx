import React from 'react';

interface HeaderProps {
  resetChat: () => void;
  isDark: boolean;
}

export const Header: React.FC<HeaderProps> = ({ resetChat, isDark }) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-800
                      bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
        <button 
          onClick={resetChat}
          className="flex items-center gap-4 focus:outline-none"
          aria-label="Reset chat"
        >
          <div className={`flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 ${
            isDark ? 'border-blue-500' : 'border-yellow-500'
          }`}>
            <img 
              src="/jacobo-grinberg2.jpg" 
              alt="Jacobo Grinberg" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Jacobo Grinberg AI
            </h1>
          </div>
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r 
                      from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
};
