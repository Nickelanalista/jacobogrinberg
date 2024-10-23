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
          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, {
              role: 'assistant',
              content: assistantMessage.content[0].text.value
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

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                      dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 
                      transition-colors duration-500">
        <div className="container mx-auto max-w-4xl h-screen p-4">
          <div className="h-full flex flex-col rounded-2xl overflow-hidden
                        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl">
            <Header />
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {chatState.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-400/10 
                                flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-400 
                                  animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      Bienvenido a Jacobo Grinberg AI
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      Inicia una conversación con tu asistente de Jacobo Grinberg AI. Haz preguntas, obtén ayuda o simplemente chatea sobre sus teorías e investigaciones.
                    </p>
                  </div>
                </div>
              )}
              
              {chatState.messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
