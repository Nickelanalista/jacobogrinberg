import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg
                    border-t border-gray-200 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-6 py-4 rounded-xl
                     bg-gray-100 dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-gray-800 dark:text-gray-200 
                     placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2
                     p-2 rounded-lg
                     bg-gradient-to-r from-blue-500 to-purple-500
                     hover:from-blue-600 hover:to-purple-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:from-blue-500 disabled:hover:to-purple-500
                     transition-all duration-200 group"
        >
          <Send className="w-5 h-5 text-white 
                          group-hover:scale-110 transition-transform duration-200" />
        </button>
      </form>
    </div>
  );
};