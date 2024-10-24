import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
}

interface SideMenuProps {
  onSelectConversation: (id: string) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Cargar conversaciones del almacenamiento local al iniciar
    const storedConversations = localStorage.getItem('conversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  useEffect(() => {
    // Guardar conversaciones en el almacenamiento local cuando cambian
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const addNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Nueva conversación ${conversations.length + 1}`,
      lastMessage: 'Inicia una nueva conversación',
    };
    setConversations([newConversation, ...conversations]);
  };

  return (
    <motion.div
      className="w-64 h-full bg-gray-800 text-white p-4 overflow-y-auto"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold mb-4">Conversaciones</h2>
      <button
        onClick={addNewConversation}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Nueva conversación
      </button>
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelectConversation(conv.id)}
          className="cursor-pointer hover:bg-gray-700 p-2 rounded mb-2"
        >
          <h3 className="font-semibold">{conv.title}</h3>
          <p className="text-sm text-gray-400">{conv.lastMessage}</p>
        </div>
      ))}
    </motion.div>
  );
};
