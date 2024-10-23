import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';
  
  return (
    <div className={`flex items-start gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                      ${isBot ? 
                        'bg-gradient-to-br from-blue-500 to-purple-500' : 
                        'bg-gradient-to-br from-green-500 to-emerald-500'}`}>
        {isBot ? (
          <Bot className="w-6 h-6 text-white" />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </div>
      <div className={`flex-1 px-6 py-4 rounded-2xl max-w-[80%] relative
                      ${isBot ? 
                        'bg-white dark:bg-gray-800 shadow-lg' : 
                        'bg-blue-500 dark:bg-blue-600'}`}>
        <p className={`text-sm md:text-base ${
          isBot ? 'text-gray-800 dark:text-gray-200' : 'text-white'
        }`}>
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