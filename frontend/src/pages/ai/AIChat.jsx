import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Send, Bot, User, Sparkles, Loader, Trash2, ChevronRight, Utensils, CircuitBoard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/PageTransition';

// --- Animation Variants ---
const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const AIChat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const { user } = useAuth(); // Get current user

  // Key depends on user ID. If no user, use 'guest'.
  const storageKey = `chatHistory_${user?._id || user?.id || 'guest'}`;

  // Initialize from Local Storage based on current user
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 1, text: "Greetings! I am your culinary concierge. What are your taste buds craving today?", sender: 'ai' }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Update messages when user changes (e.g. login/logout)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ id: 1, text: "Greetings! I am your culinary concierge. What are your taste buds craving today?", sender: 'ai' }]);
    }
  }, [storageKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Save to Local Storage with user-scoped key
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    scrollToBottom();
  }, [messages, storageKey]);

  const clearChat = () => {
    const initialMsg = [{ id: Date.now(), text: "Greetings! I am your culinary concierge. What are your taste buds craving today?", sender: 'ai' }];
    setMessages(initialMsg);
    localStorage.removeItem(storageKey);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMsg.text,
        userLocation: 'Lahore'
      });

      const aiMsg = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'ai',
        recommendations: response.data.recommendedItems
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = { id: Date.now() + 1, text: "Apologies, I seem to have lost connection to the kitchen. Please try again momentarily.", sender: 'ai' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="pt-20 md:pt-20 px-0 md:px-4 pb-0 md:pb-2 flex flex-col items-center h-[100dvh] md:h-screen bg-[#f8f5f0] overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow z-0">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium z-0">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast z-0"><CircuitBoard size={120} /></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl flex flex-col h-full md:h-[92vh] bg-white md:rounded-[2.5rem] shadow-2xl border border-stone-100 overflow-hidden relative"
      >

        {/* --- Header --- */}
        <div className="px-8 py-5 bg-stone-900 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/40">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif tracking-wide food">
                FoodieAI <Sparkles size={16} className="text-yellow-400 animate-pulse" />
              </h2>
              <p className="text-xs text-stone-400 font-medium tracking-wide uppercase">Premium Dining Assistant</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-3 text-stone-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-all"
            title="Clear Chat History"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* --- Messages Area --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-stone-50 messages-container">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} md:max-w-[80%] max-w-[95%]`}>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border 
                    ${msg.sender === 'user' ? 'bg-stone-200 border-stone-300' : 'bg-white border-stone-100'}`}>
                    {msg.sender === 'user' ? <User size={16} className="text-stone-600" /> : <Bot size={16} className="text-orange-500" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm relative font-medium
                      ${msg.sender === 'user'
                        ? 'bg-stone-800 text-stone-100 rounded-lr-none shadow-stone-900/10'
                        : 'bg-white text-stone-700 border border-stone-200 rounded-ll-none'
                      }`}
                  >
                    {msg.sender === 'ai' && !msg.text ? (
                      <div className="flex items-center gap-2">
                        <Loader size={14} className="animate-spin text-orange-500" />
                        <span className="italic text-stone-400 text-xs">Consulting the chefs...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}
                  </div>
                </div>

                {/* Recommendations Grid */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex flex-col gap-3 w-full max-w-[85%] mt-2 ${msg.sender === 'user' ? 'mr-12' : 'ml-12'}`}
                  >
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-widest pl-1">Chef's Selection</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {msg.recommendations.map((item, idx) => (
                        <motion.div
                          key={idx}
                          variants={messageVariants}
                          whileHover={{ y: -5 }}
                          className="bg-white p-4 rounded-2xl border border-stone-100 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                          onClick={() => navigate(item.type === 'deal' ? '/deals' : '/restaurants')}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide ${item.type === 'deal' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                              {item.type === 'deal' ? 'Exclusive Deal' : 'Featured Item'}
                            </span>
                            <span className="text-stone-900 font-bold text-sm">Rs. {item.price}</span>
                          </div>
                          <h4 className="font-bold text-stone-900 font-serif text-lg mb-1 group-hover:text-red-600 transition-colors">{item.title}</h4>
                          <p className="text-sm text-stone-500 line-clamp-1 mb-3">{item.subtitle || item.restaurant}</p>
                          <button className="flex items-center gap-2 text-xs font-bold text-stone-900 group-hover:gap-3 transition-all">
                            View Details <ChevronRight size={14} className="text-red-500" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 ml-1"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-stone-100 flex items-center justify-center">
                <Bot size={16} className="text-orange-500" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-stone-100 shadow-sm flex gap-1">
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* --- Input Area --- */}
        <div className="p-6 bg-white border-t border-stone-100">
          <form onSubmit={handleSend} className="relative max-w-3xl mx-auto flex items-center gap-4">
            <div className="relative flex-1 group">
              <input
                type="text"
                placeholder="Ask for spicy wings, italian pasta, or romantic spots..."
                className="w-full bg-stone-50 text-stone-900 pl-6 pr-14 py-4 rounded-2xl border-2 border-transparent focus:border-stone-200 focus:bg-white focus:ring-0 transition-all outline-none font-medium placeholder:text-stone-400"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Sparkles size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-400 transition-colors" />
            </div>
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="h-[58px] w-[58px] flex items-center justify-center bg-stone-900 text-white rounded-2xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-stone-900 transition-all shadow-xl shadow-stone-900/20"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          <p className="text-center text-xs text-stone-300 mt-3">FoodieAI can make mistakes. Please verify important info.</p>
        </div>

      </motion.div>
    </PageTransition>
  );
};

export default AIChat;
