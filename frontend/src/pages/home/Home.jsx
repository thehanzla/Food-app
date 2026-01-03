import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bot, Star, TrendingUp, Sparkles, Zap, Award, ChefHat,
  ArrowRight, QrCode, MessageSquare, Utensils, Heart, Info, User, Store, FileText, Check, Coffee, Flame, Leaf, Clock, Smile, CircuitBoard, Brain, ShieldCheck, DollarSign, Timer, Tag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../services/api'

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const sectionReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] }
  }
};

// Fun Facts Data
const initialFoodFacts = [
  { id: 1, title: "Honey Time Travel", fact: "Honey never spoils. Archaeologists found 3000-year-old honey in tombs!", emoji: "🍯", color: "bg-[#fffbf2]" },
  { id: 2, title: "Chocolate Health", fact: "Dark chocolate can reduce stress and improve heart health.", emoji: "🍫", color: "bg-[#fffbf2]" },
  { id: 3, title: "Slow Pineapples", fact: "It takes almost 2-3 years for a single pineapple to reach full maturity.", emoji: "🍍", color: "bg-[#fffbf2]" },
  { id: 4, title: "Queen Pizza", fact: "Elements of pizza have been around for centuries, but the modern version started in Naples.", emoji: "🍕", color: "bg-[#fffbf2]" }
];

// Mood Vibes Data
const foodMoods = [
  { id: 'spicy', label: 'Spicy', icon: Flame, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'healthy', label: 'Healthy', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'quick', label: 'Quick Bite', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'comfort', label: 'Comfort', icon: Smile, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' }
];

// Active Deals Data (Real Brands)
const activeDeals = [
  { id: 1, restaurant: "Cheezious", title: "Crown Crust Pizza", price: "Rs. 1200", discount: "Flat 50% OFF", color: "bg-orange-500", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
  { id: 2, restaurant: "Bundu Khan", title: "Royal BBQ Platter", price: "Rs. 2499", discount: "Save 30%", color: "bg-red-600", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
  { id: 3, restaurant: "Savour Foods", title: "Chicken Pulao Deal", price: "Rs. 450", discount: "Buy 1 Get 1", color: "bg-green-600", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80" }
];

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate();
  const userData = user || JSON.parse(localStorage.getItem('userData') || 'null')
  const [activeMood, setActiveMood] = useState('spicy')
  const [cards, setCards] = useState(initialFoodFacts);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    if (userData) {
      const fetchFavorites = async () => {
        try {
          const response = await api.get('/auth/favorites');
          if (response.data.success) {
            const favMap = {};
            response.data.favorites.forEach(fav => {
              // Use a simple key based on title+restaurant to match local deals
              favMap[`${fav.title}-${fav.restaurant}`] = true;
            });
            setFavorites(favMap);
          }
        } catch (error) {
          console.error("Failed to fetch favorites", error);
        }
      };
      fetchFavorites();
    }
  }, [userData]);

  const moveToEnd = (index) => {
    setCards((current) => {
      const items = [...current];
      const [movedItem] = items.splice(index, 1);
      items.push(movedItem);
      return items;
    });
  };

  const toggleFavorite = async (deal) => {
    if (!userData) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    const dealKey = `${deal.title}-${deal.restaurant}`;
    const isFavorited = favorites[dealKey];

    // Optimistic UI Update
    setFavorites(prev => {
      const newState = { ...prev };
      if (isFavorited) delete newState[dealKey];
      else newState[dealKey] = true;
      return newState;
    });

    try {
      const itemPayload = {
        itemId: `deal_${deal.id}`, // Generate a consistent ID
        title: deal.title,
        price: parseInt(deal.price.replace(/[^0-9]/g, '')), // Clean "Rs. 1200" to 1200
        restaurant: deal.restaurant,
        type: 'deal',
        description: deal.discount
      };

      const response = await api.post('/auth/favorites/toggle', { item: itemPayload });

      if (!response.data.success) {
        // Revert on failure
        setFavorites(prev => ({ ...prev, [dealKey]: isFavorited }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      setFavorites(prev => ({ ...prev, [dealKey]: isFavorited }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden text-stone-900 bg-[#f8f5f0]">

      {/* --- SCROLL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 origin-left z-50" style={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5 }} />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-28 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow">🍅</div>
        <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium">🥬</div>
        <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast"><CircuitBoard size={120} /></div>

        <div className="container mx-auto max-w-7xl relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex-1 text-center lg:text-left z-20"
            >
              {userData && (
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-stone-200 mb-8 backdrop-blur-sm shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-stone-800 text-sm font-bold tracking-wide uppercase">Bon Appétit, {userData.fullName.split(' ')[0]}</span>
                </motion.div>
              )}

              <motion.h1 variants={fadeInUp} className="text-6xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tighter mix-blend-multiply text-stone-900 font-serif">
                Taste the <br />
                <span className="text-red-600 italic relative">
                  Extraordinary
                  <svg className="absolute w-full h-4 -bottom-2 left-0 text-orange-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" /></svg>
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl lg:text-2xl text-stone-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed font-sans">
                Experience the future of dining. AI-curated menus, zero wait times, and flavors tailored to your palate.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center lg:items-start">
                <Link to="/ai-chat" className="btn-primary flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 hover:shadow-red-500/40">
                  <Zap size={20} className="fill-white" /> Ask AI Chef
                </Link>
                <Link to="/restaurants" className="btn-secondary flex items-center justify-center gap-2 group">
                  Browse Menus <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="flex-1 relative hidden lg:block h-[600px] perspective-1000 z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-red-100 rounded-full blur-[80px] opacity-40"></div>

              <div className="absolute top-10 right-10 w-96 h-[520px] bg-[#fffbf2] rounded-[2.5rem] border border-stone-100 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.1)] p-5 flex flex-col group overflow-hidden animate-float-slow">
                <div className="h-3/5 overflow-hidden rounded-[2rem] relative shadow-inner">
                  <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Steak" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-stone-100 text-stone-900 shadow-lg">Featured</div>
                </div>
                <div className="flex-1 pt-8 px-2 flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-serif font-bold mb-2 text-stone-900">Prime Ribeye</h3>
                    <div className="flex gap-1 text-orange-500">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-4 border border-red-100">
                    <div className="bg-red-100 p-2.5 rounded-full"><Bot size={20} className="text-red-600" /></div>
                    <p className="text-xs font-bold text-red-900 leading-tight">"Match 98% (Meat Lover)"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- OUR PARTNERS (MARQUEE) --- */}
      <section className="py-12 border-y border-stone-200 bg-white overflow-hidden relative">
        <div className="container mx-auto px-6 text-center mb-8">
          <p className="text-sm font-bold tracking-widest uppercase text-stone-400">Our Available Restaurants</p>
        </div>
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex gap-16 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Kolachi', 'Bundu Khan', 'Cheezious', 'Savour Foods', 'KFC Pakistan', 'OPTP', 'Gloria Jean\'s', 'McDonald\'s PK', 'Kolachi', 'Bundu Khan', 'Cheezious', 'Savour Foods'].map((brand, i) => (
              <span key={i} className="text-3xl font-black text-stone-300 font-serif inline-block mx-4">{brand}</span>
            ))}
          </div>
          <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Kolachi', 'Bundu Khan', 'Cheezious', 'Savour Foods', 'KFC Pakistan', 'OPTP', 'Gloria Jean\'s', 'McDonald\'s PK', 'Kolachi', 'Bundu Khan', 'Cheezious', 'Savour Foods'].map((brand, i) => (
              <span key={i} className="text-3xl font-black text-stone-300 font-serif inline-block mx-4">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* --- MEET THE BRAIN (AI) --- */}
      <section className="py-32 bg-[#fffbf2] text-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#e7e5e4 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col md:flex-row items-center gap-16"
          >
            <div className="flex-1">
              <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-3 block">Powered by Gemini</span>
              <h2 className="text-5xl md:text-7xl font-black font-serif mb-8 leading-none text-stone-900">Meet Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Desi Foodie Brain.</span></h2>
              <p className="text-xl text-stone-600 font-medium mb-10 leading-relaxed">
                Stop scrolling. Just ask. Need "Best Nihari in Lahore" or "Cheap deals for 4 people"? Our AI knows every street corner.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Halal & Safe", desc: "Verifies Halal status automatically.", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" },
                  { title: "Budget Wizard", desc: "Finds the best meal under Rs. 1500.", icon: DollarSign, color: "text-orange-600", bg: "bg-orange-100" },
                  { title: "Flavor Match", desc: "Learns if you like Extra Spicy or Mild.", icon: Brain, color: "text-red-600", bg: "bg-red-100" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}><item.icon size={24} /></div>
                    <div>
                      <h4 className="text-lg font-bold text-stone-900">{item.title}</h4>
                      <p className="text-stone-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link to="/ai-chat" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20">
                  <MessageSquare size={20} /> Start Chatting
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md relative">
              <div className="absolute inset-0 bg-orange-200 blur-[80px] opacity-40"></div>
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl relative">
                <div className="space-y-5">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-stone-100 text-stone-800 px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium border border-stone-100">
                      Recommend spicy Biryani under Rs. 500? 🌶️
                    </div>
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">Me</div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><Bot size={16} color="white" /></div>
                    <div className="bg-red-50 text-stone-800 px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-medium border border-red-100">
                      <p className="mb-2">I found a top-rated spot! <span className="text-green-600 font-bold">98% Match</span></p>
                      <div className="bg-white border border-stone-100 rounded-xl p-3 flex gap-3 items-center mt-2 shadow-sm">
                        <div className="w-12 h-12 bg-stone-200 rounded-lg overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=100&q=80" alt="Biryani" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">Hyderabadi Special</p>
                          <p className="text-xs text-stone-500">Rs. 450 • Double Masala 🔥</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CULTURAL HERITAGE (FIXED RESPONSIVE IMAGE) --- */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-[#b91c1c] text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute -left-40 top-20 w-80 h-80 bg-orange-500 rounded-full blur-[100px] opacity-50 mix-blend-screen"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
          >
            <div className="flex-1 text-center lg:text-left z-20">
              <span className="text-yellow-400 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">The Soul of Lahore</span>
              <h2 className="text-4xl lg:text-7xl font-black font-serif mb-6 leading-none">
                Legacy of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Street Flavors</span>
              </h2>
              <p className="text-lg lg:text-xl text-red-100 font-medium mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                From the smoky aroma of Gawalmandi to the spicy Nihari of Anarkali. We expertly curate the hidden gems that have defined Lahore's "Desi" culture for centuries.
              </p>

              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {[
                  { name: "Androon Vibes", icon: "🕌" },
                  { name: "Desi Ghee Only", icon: "🥣" },
                  { name: "Tandoori Nights", icon: "🔥" },
                  { name: "Sweet Endings", icon: "🍮" }
                ].map((tag, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-2 md:gap-3 bg-red-900/40 p-3 md:p-4 rounded-xl border border-red-800 backdrop-blur-sm hover:bg-red-900/60 transition-colors cursor-default text-center lg:text-left">
                    <span className="text-2xl">{tag.icon}</span>
                    <span className="font-bold text-sm md:text-lg font-serif">{tag.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Image Container using rigorous sizing */}
            <div className="w-full h-[400px] lg:h-[600px] lg:flex-1 relative mt-12 lg:mt-0">
              <div className="absolute top-4 lg:top-10 left-4 lg:left-10 w-full h-full border-2 border-yellow-500/30 rounded-[2rem] lg:rounded-[3rem] transform rotate-2"></div>

              <div className="absolute inset-0 bg-red-800 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl z-10">
                <img
                  src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80"
                  alt="Authentic Tandoori Chicken"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 lg:p-10 pt-20 lg:pt-32 text-left">
                  <h3 className="text-2xl lg:text-4xl font-bold font-serif text-yellow-500 mb-2 drop-shadow-md">Gawalmandi Food Street</h3>
                  <p className="text-red-100 font-medium text-sm lg:text-lg drop-shadow-sm">The heart of late-night cravings.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- MOOD PICKER SECTION --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-10 left-10 opacity-5 text-stone-900"><Utensils size={150} /></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f8f5f0] to-white pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-3 block">Personalized Craving</span>
            <h2 className="text-5xl lg:text-6xl font-black mb-4 font-serif text-stone-900">What's your Vibe?</h2>
            <p className="text-stone-500 text-xl font-medium">Select a mood to instantly filter dining options.</p>
          </motion.div>

          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16"
          >
            {foodMoods.map((mood) => (
              <motion.button
                key={mood.id}
                onClick={() => setActiveMood(mood.id)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 md:p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${activeMood === mood.id ? `${mood.bg} ${mood.border} shadow-xl ring-2 ring-offset-2 ring-${mood.color.split('-')[1]}-200` : 'bg-stone-50 border-transparent hover:bg-white hover:border-stone-200 hover:shadow-lg'}`}
              >
                <div className={`p-4 rounded-full bg-white shadow-sm ${mood.color}`}>
                  <mood.icon size={32} />
                </div>
                <span className={`font-bold text-xl font-serif ${activeMood === mood.id ? 'text-stone-900' : 'text-stone-400'}`}>{mood.label}</span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            key={activeMood}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-[2.5rem] p-8 md:p-12 ${foodMoods.find(m => m.id === activeMood)?.bg} border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl overflow-hidden relative`}
          >
            <div className="flex-1 relative z-10">
              <h3 className="text-4xl lg:text-5xl font-black mb-4 flex items-center gap-3 font-serif text-stone-900">
                {activeMood === 'spicy' && "Heat Seeker Mode 🔥"}
                {activeMood === 'healthy' && "Green & Clean 🥗"}
                {activeMood === 'quick' && "Speedy Eats ⚡"}
                {activeMood === 'comfort' && "Cozy Vibes 🍜"}
              </h3>
              <p className={`text-xl mb-8 font-medium leading-relaxed ${activeMood === 'spicy' ? 'text-red-800' : activeMood === 'healthy' ? 'text-green-800' : activeMood === 'quick' ? 'text-blue-800' : 'text-orange-900'}`}>
                {activeMood === 'spicy' && "Craving a kick? We've curated the hottest Sichuan, Mexican, and Indian spots near you."}
                {activeMood === 'healthy' && "Nutritious doesn't mean boring. Discover organic bowls, fresh salads, and smoothie bars."}
                {activeMood === 'quick' && "In a rush? Find spots with <15 min prep time and express pickup lanes."}
                {activeMood === 'comfort' && "Long day? Treat yourself to hearty pastas, warm soups, and nostalgic flavors."}
              </p>
              <Link to="/restaurants" className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 shadow-xl">
                Find {foodMoods.find(m => m.id === activeMood)?.label} Food <ArrowRight size={20} />
              </Link>
            </div>
            <div className="hidden md:block w-72 h-72 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rotate-3 p-3 relative z-10 transition-transform duration-500 hover:rotate-0 hover:scale-105">
              <img
                src={
                  activeMood === 'spicy' ? "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=600&q=80" :
                    activeMood === 'healthy' ? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80" :
                      activeMood === 'quick' ? "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80" :
                        "https://images.unsplash.com/photo-1619379659020-f6b9f2d15919?auto=format&fit=crop&w=600&q=80"
                }
                className="w-full h-full object-cover rounded-2xl"
                alt="Mood Food"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- ACTIVE DEALS SECTION (REAL DEAL SYNC) --- */}
      <section className="py-24 bg-stone-900 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444), linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <span className="text-green-400 font-bold tracking-widest uppercase text-sm mb-2 block animate-pulse">Live Offers @ FoodieAI</span>
              <h2 className="text-4xl md:text-6xl font-black font-serif text-white food">Hungry for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Savings?</span></h2>
            </div>
            <Link to="/deals" className="btn-secondary text-white border-stone-600 hover:bg-stone-800 hover:border-stone-500">View All Deals</Link>
          </motion.div>

          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {activeDeals.map((deal) => {
              // Check if favorites logic matches
              const dealKey = `${deal.title}-${deal.restaurant}`;
              const isFav = favorites[dealKey];

              return (
                <motion.div
                  key={deal.id}
                  whileHover={{ y: -10 }}
                  className="bg-stone-800 rounded-3xl overflow-hidden border border-stone-700 shadow-xl group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={deal.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" alt={deal.title} />
                    <div className={`absolute top-4 left-4 ${deal.color} text-white font-bold px-4 py-1 rounded-full text-sm shadow-lg`}>
                      {deal.discount}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-orange-400 text-xs font-bold uppercase tracking-wider block mb-1">{deal.restaurant}</span>
                        <h3 className="text-2xl font-bold text-white font-serif">{deal.title}</h3>
                      </div>
                    </div>
                    <p className="text-stone-400 mb-6 font-medium text-lg">{deal.price}</p>

                    <div className="mt-4">
                      <button
                        onClick={() => toggleFavorite(deal)}
                        className={`w-full py-3 rounded-xl border border-stone-600 transition-all flex items-center justify-center gap-2 font-bold ${isFav ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/40' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white hover:border-stone-500'}`}
                      >
                        <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                        {isFav ? "Saved!" : "Add to Favorites"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* --- SCROLL REVEAL "DECK OF CARDS" SECTION (FIXED TEXT COLOR) --- */}
      <section className="py-32 bg-[#1e1b4b] text-[#f8f5f0] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute top-20 left-20 opacity-10 text-indigo-200"><Coffee size={100} /></div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16 md:mb-24 max-w-2xl"
          >
            <div className="inline-block bg-indigo-900/50 px-6 py-2 rounded-full border border-indigo-700/50 mb-6 shadow-lg backdrop-blur-sm">
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-indigo-300">Daily Knowledge</span>
            </div>
            {/* FIXED TEXT COLOR ISSUE: Ensure heading uses explicit white */}
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight font-serif text-white food">Food for Thought</h2>
            <p className="text-xl text-indigo-200 font-medium font-sans">Swipe cards to reveal more tasty tidbits.</p>
          </motion.div>

          <div className="h-[500px] w-full max-w-xl flex items-center justify-center relative perspective-1000 touch-none">
            <AnimatePresence>
              {cards.map((fact, index) => {
                if (index > 2) return null;

                return (
                  <motion.div
                    key={fact.id}
                    layout
                    initial={{ scale: 0.8, y: 50, opacity: 0 }}
                    animate={{
                      scale: 1 - index * 0.05,
                      y: index * 40,
                      zIndex: cards.length - index,
                      opacity: 1 - index * 0.2
                    }}
                    exit={{ x: 300, opacity: 0, rotate: 20 }}
                    drag={index === 0 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 100) {
                        moveToEnd(index);
                      }
                    }}
                    whileTap={{ cursor: "grabbing" }}
                    // Card bg is light (#fffbf2), so text needs to be dark (stone-900).
                    className={`absolute w-72 md:w-96 h-[28rem] md:h-[30rem] ${fact.color} border-4 border-indigo-950 rounded-[2.5rem] cursor-grab shadow-2xl flex flex-col items-center justify-center p-8 text-center transition-colors`}
                    style={{
                      touchAction: 'none'
                    }}
                  >
                    <div className="flex flex-col items-center justify-between h-full py-2">
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-8xl md:text-9xl filter drop-shadow-xl animate-bounce-slow">{fact.emoji}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-end pb-8">
                        {/* Ensure card text is dark for readability on light card bg */}
                        <h3 className="text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-tighter font-serif leading-none mb-4">{fact.title}</h3>
                        <p className="text-lg md:text-xl font-medium text-stone-600 leading-snug font-serif italic text-balance">"{fact.fact}"</p>
                        {index === 0 && (
                          <div className="mt-6 text-xs font-bold uppercase tracking-widest text-stone-400 bg-stone-100 py-2 px-4 rounded-full mx-auto">
                            Swipe to Next &rarr;
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home