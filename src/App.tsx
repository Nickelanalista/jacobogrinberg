import React, { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { Message, ChatState } from './types';
import OpenAI from 'openai';
import { config } from './config/env';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { Copy, Share2 } from 'lucide-react';

let openai: OpenAI;
try {
  openai = new OpenAI({
    apiKey: config.openaiApiKey,
    dangerouslyAllowBrowser: true
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
}

function App() {
  const chatStarters = [
    "¿Qué es la Teoría Sintérgica?",
    "¿Qué opinas sobre la realidad?",
    "¿Cómo se relaciona el trabajo de Grinberg con la física cuántica?",
    "Explica el concepto de 'lattice' en la teoría de Grinberg"
  ];

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark);
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    const chatContainer = document.querySelector('.overflow-y-auto');
    if (chatContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        if (scrollHeight - scrollTop === clientHeight) {
          scrollToBottom();
        }
      };
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Ajuste inicial
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!openai) {
      setChatState(prev => ({
        ...prev,
        error: 'OpenAI client not initialized. Check your API key.'
      }));
      return;
    }

    const newMessage: Message = { role: 'user', content };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isLoading: true,
      error: null
    }));

    try {
      const thread = await openai.beta.threads.create();
      
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content
      });

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: config.assistantId
      });

      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      if (runStatus.status === 'completed') {
        const response = await openai.beta.threads.messages.list(thread.id);
        const assistantMessage = response.data[0];
        
        if (assistantMessage.role === 'assistant') {
          const messageContent = assistantMessage.content[0];
          const textContent = 'text' in messageContent ? messageContent.text.value : 'Contenido no textual';
          
          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, {
              role: 'assistant',
              content: textContent
            }],
            isLoading: false
          }));
        }
      } else {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response from AI. Please check your API key and Assistant ID.'
      }));
    }
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const resetChat = () => {
    setChatState({ messages: [], isLoading: false, error: null });
  };

  return (
    <div className={`${isDark ? 'dark' : ''} h-screen flex flex-col`}>
      <div className="flex-grow bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                    dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 
                    transition-colors duration-500 overflow-hidden">
        <div className="container mx-auto h-full p-4 flex flex-col max-w-2xl">
          <div className="h-full flex flex-col rounded-2xl overflow-hidden
                        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl">
            <Header resetChat={resetChat} isDark={isDark} />
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {chatState.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 px-4">
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                    isDark ? 'border-blue-500' : 'border-yellow-500'
                  } transition-colors duration-300`}>
                    <img 
                      src="/jacobo-grinberg.jpg" 
                      alt="Jacobo Grinberg" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center space-y-3 max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                      Bienvenido a Jacobo Grinberg AI
                    </h2>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>By @CordilleraLabs</span>
                      <User size={16} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Inicia una conversación con tu asistente de Jacobo Grinberg AI. Haz preguntas, obtén ayuda o simplemente chatea sobre sus teorías e investigaciones.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {chatStarters.map((starter, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(starter)}
                          className="px-3 py-2 bg-gray-800/30 text-white 
                                     rounded-lg hover:bg-gray-700/50 transition-colors 
                                     duration-200 text-xs text-left overflow-hidden 
                                     flex items-center backdrop-blur-sm
                                     border border-gray-600 dark:border-gray-400"
                        >
                          <span className="truncate w-full">
                            {starter}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {chatState.messages.map((message, index) => (
                    <ChatMessage 
                      key={index} 
                      message={message} 
                      isDark={isDark} 
                      timestamp={new Date()}
                    />
                  ))}
                </>
              )}
              
              {chatState.isLoading && (
                <motion.div 
                  className="flex justify-center items-center space-x-2 my-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-4 h-4 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1,
                      ease: "easeInOut",
                      times: [0, 0.5, 1],
                      repeat: Infinity,
                    }}
                  />
                  <motion.div
                    className="text-blue-500 font-medium"
                    animate={{
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  >
                    Jacobo está pensando...
                  </motion.div>
                </motion.div>
              )}
              
              {chatState.error && (
                <div className="mx-auto max-w-md">
                  <div className="text-red-500 text-center p-4 bg-red-100/80 dark:bg-red-900/20 
                                rounded-xl shadow-lg">
                    <p className="font-medium">{chatState.error}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <ChatInput 
              onSendMessage={handleSendMessage}
              isLoading={chatState.isLoading}
            />
          </div>
        </div>
      </div>
      <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
        Desarrollado por @CordilleraLabs
      </div>
    </div>
  );
}

export default App;
