import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';
  
  return (
    <div className={`flex items-start gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      {isBot ? (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 dark:border-blue-400">
          <img 
            src="/assets/jacobo-grinberg.jpg" 
            alt="Jacobo Grinberg" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <img 
            src="/assets/user-avatar.png" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className={`flex-1 px-6 py-4 rounded-2xl max-w-[80%] relative
                      ${isBot ? 
                        'bg-gray-700 text-white' : 
                        'bg-blue-500 text-white'}`}>
        <p className="text-sm md:text-base">
          {message.content}
        </p>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 rounded-2xl opacity-10 
                        bg-gradient-to-br from-white/50 to-transparent" />
        <div className="absolute inset-px rounded-2xl opacity-20 
                        bg-[radial-gradient(circle_at_top_left,_transparent_25%,_white_100%)]" />
      </div>
    </div>
  );
};
