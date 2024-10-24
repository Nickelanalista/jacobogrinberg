import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { Copy, Share2 } from 'lucide-react';

// Actualiza la interfaz de props
interface ChatMessageProps {
  message: Message;
  isDark: boolean;
  timestamp: Date;
}

// Actualiza la definición del componente
export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isDark, timestamp }) => {
  const isBot = message.role === 'assistant';
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(isBot);
  const [isCopied, setIsCopied] = useState(false);
  
  const bgColor = isBot
    ? isDark ? 'bg-gray-800' : 'bg-gray-200'
    : isDark ? 'bg-blue-600' : 'bg-blue-400';
  
  const textColor = isBot ? (isDark ? 'text-white' : 'text-black') : 'text-white';

  useEffect(() => {
    if (isBot) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedContent(message.content.slice(0, i));
        i++;
        if (i > message.content.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [isBot, message.content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // El mensaje desaparecerá después de 2 segundos
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Compartir mensaje',
        text: message.content,
      }).catch(console.error);
    } else {
      console.log('Web Share API no soportada');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      className={`flex items-start gap-2 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isBot ? (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 dark:border-blue-400">
          <img 
            src="/assets/jacobo-grinberg.jpg" 
            alt="Jacobo Grinberg" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 ${
          isDark ? 'border-blue-500' : 'border-yellow-500'
        }`}>
          <img 
            src="/assets/user-avatar.png" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className={`relative flex-1 px-6 py-4 pb-10 rounded-2xl max-w-[80%] ${bgColor} ${textColor}`}>
        <p className="text-sm md:text-base mb-2">
          {displayedContent}
          {isTyping && (
            <motion.span
              className="inline-block w-2 h-2 ml-1 bg-current rounded-full"
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            />
          )}
        </p>
        <p className="text-xs opacity-50 absolute bottom-2 left-6">
          {formatTime(timestamp)}
        </p>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 rounded-2xl opacity-10 
                        bg-gradient-to-br from-white/50 to-transparent" />
        <div className="absolute inset-px rounded-2xl opacity-20 
                        bg-[radial-gradient(circle_at_top_left,_transparent_25%,_white_100%)]" />
        
        {/* Botones de copiar y compartir */}
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button
            onClick={handleCopy}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            aria-label="Copiar mensaje"
          >
            <Copy size={16} className="text-current" />
          </button>
          <button
            onClick={handleShare}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            aria-label="Compartir mensaje"
          >
            <Share2 size={16} className="text-current" />
          </button>
        </div>
      </div>
      {isCopied && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-12 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs"
        >
          Copiado al portapapeles
        </motion.div>
      )}
    </motion.div>
  );
};
