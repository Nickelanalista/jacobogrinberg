import React from 'react';

interface HeaderProps {
  resetChat: () => void;
  isDark: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ resetChat, isDark, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800
                      bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
        <button 
          onClick={resetChat}
          className="flex items-center gap-3 focus:outline-none"
          aria-label="Reset chat"
        >
          <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 ${
            isDark ? 'border-blue-500' : 'border-yellow-500'
          }`}>
            <img 
              src="/jacobo-grinberg2.jpg" 
              alt="Jacobo Grinberg" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-3 opacity-50"></div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
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
