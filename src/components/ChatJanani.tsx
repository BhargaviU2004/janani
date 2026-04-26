import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { askJanani } from '../lib/chatbot';
import { MessageCircle, Send, X, Bot, User, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ChatJanani() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hi! I'm Janani 🤰. How can I support you today? 🌟" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const response = await askJanani(userMessage, profile);
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm here for you! ✨" }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-[#B2E2F2] text-[#5A5A40] p-4 rounded-full shadow-lg z-40 hover:scale-110 transition-all border-2 border-white"
      >
        <MessageCircle className="w-8 h-8" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 border-2 border-white rounded-full"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed inset-x-6 bottom-24 top-20 bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-[#B2E2F2]"
          >
            {/* Header */}
            <div className="bg-[#B2E2F2] p-6 flex justify-between items-center bg-gradient-to-r from-[#B2E2F2] to-[#FFDAC1]">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-2xl shadow-sm">
                  <Bot className="w-6 h-6 text-[#5A5A40]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#5A5A40]">Ask Janani</h3>
                  <p className="text-[10px] text-[#5A5A40]/60 uppercase tracking-widest font-bold">Health Guide 🌟</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full"
              >
                <X className="w-6 h-6 text-[#5A5A40]" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-[#FFDAC1]' : 'bg-[#B2E2F2]'}`}>
                      {m.role === 'user' ? <User className="w-4 h-4 text-[#5A5A40]" /> : <Bot className="w-4 h-4 text-[#5A5A40]" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm ${
                      m.role === 'user' 
                        ? 'bg-[#FFDAC1] text-[#5A5A40] rounded-tr-none' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm'
                    }`}>
                      {m.content.startsWith('[EMERGENCY ADVICE]') ? (
                        <div className="flex gap-3 text-red-600 font-bold">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p>{m.content}</p>
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert">
                          <Markdown>{m.content}</Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 p-4 rounded-2xl animate-pulse flex gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t dark:border-gray-800 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask me about morning sickness, exercises..." 
                className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded-[20px] text-sm focus:outline-none focus:ring-2 focus:ring-[#B2E2F2] dark:text-gray-100"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="p-4 bg-[#B2E2F2] text-[#5A5A40] rounded-[20px] hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
