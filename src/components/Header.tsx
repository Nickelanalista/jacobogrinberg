import React from 'react';
import { Bot } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800
                      bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl
                        bg-gradient-to-br from-blue-500 to-purple-500">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Jacobo Grinberg AI
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @CordilleraLabs
          </p>
        </div>
      </div>
      
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r 
                      from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
};