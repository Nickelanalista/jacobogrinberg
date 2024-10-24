import React, { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { Message, ChatState } from './types';
import OpenAI from 'openai';
import { config } from './config/env';

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

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark);
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

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
    <div className={`${isDark ? 'dark' : ''} min-h-screen`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                      dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 
                      transition-colors duration-500">
        <div className="container mx-auto max-w-4xl h-screen p-4">
          <div className="h-full flex flex-col rounded-2xl overflow-hidden
                        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl">
            <Header resetChat={resetChat} isDark={isDark} />
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {chatState.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 px-4">
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                    isDark ? 'border-blue-500' : 'border-yellow-500'
                  } transition-colors duration-300`}>
                    <img 
                      src="/src/assets/jacobo-grinberg.jpg" 
                      alt="Jacobo Grinberg" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center space-y-3 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      Bienvenido a Jacobo Grinberg AI
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Inicia una conversación con tu asistente de Jacobo Grinberg AI. Haz preguntas, obtén ayuda o simplemente chatea sobre sus teorías e investigaciones.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3 max-w-xs mx-auto">
                      {chatStarters.map((starter, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(starter)}
                          className="px-2 py-1 bg-blue-600 text-white 
                                     rounded-lg hover:bg-blue-700 transition-colors 
                                     duration-200 text-[10px] text-left overflow-hidden 
                                     h-12 flex items-center"
                        >
                          <span className="truncate w-full">
                            {starter}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {chatState.messages.map((message, index) => (
                <ChatMessage key={index} message={message} isDark={isDark} />
              ))}
              
              {chatState.isLoading && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400">
                    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full animate-bounce" />
                  </div>
                </div>
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
            <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
              Desarrollado por @CordilleraLabs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
