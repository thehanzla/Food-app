import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Heart, User, MapPin, Mail, Trash2, ArrowRight, Sparkles, LogOut, ChevronRight, CircuitBoard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/PageTransition';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFav, setSelectedFav] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/auth/favorites');
        if (response.data.success) {
          setFavorites(response.data.favorites);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (item) => {
    try {
      await api.post('/auth/favorites/toggle', { item });
      setFavorites(prev => prev.filter(f => !(f.title === item.title && f.restaurant === item.restaurant)));
      if (selectedFav && selectedFav.title === item.title) setSelectedFav(null);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-stone-500 font-medium">
      Please login to view profile
    </div>
  );

  return (
    <PageTransition className="min-h-screen bg-[#f8f5f0] pt-28 pb-20 px-6 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow z-0">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium z-0">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast z-0"><CircuitBoard size={120} /></div>

      {/* --- SCROLL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 origin-left z-50" style={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5 }} />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 font-serif tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Profile</span>
            </h1>
            <p className="text-stone-500 text-lg">Manage your account and saved culinary gems</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-stone-900 border border-stone-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-bold shadow-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* User Details Card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="md:col-span-1"
          >
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-stone-100 sticky top-28">
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-stone-800 to-stone-900 rounded-full flex items-center justify-center shadow-2xl shadow-stone-900/20 border-4 border-white">
                  <span className="text-5xl font-black text-white font-serif">{user.fullName.charAt(0)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <User className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Full Name</p>
                    <p className="font-bold text-stone-900 text-lg">{user.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Mail className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Email Address</p>
                    <p className="font-bold text-stone-900 text-sm truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Sparkles className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Membership</p>
                    <p className="font-bold text-stone-900 capitalize flex items-center gap-2">
                      {user.role} <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Pro</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Favorites Section */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-2 bg-red-100 rounded-full">
                <Heart className="text-red-500 fill-red-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 font-serif">Saved <span className="text-stone-400">Collections</span></h2>
            </motion.div>

            {loading ? (
              <div className="text-stone-400 text-center py-20 animate-pulse font-medium">Loading your collections...</div>
            ) : favorites.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 gap-5"
              >
                {favorites.map((fav, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => removeFavorite(fav)} className="p-2 bg-white/90 rounded-full hover:bg-red-50 hover:text-red-500 shadow-sm border border-stone-100 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide ${fav.type === 'deal' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                        {fav.type === 'deal' ? 'Deal' : 'Item'}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-xl mb-1 leading-tight font-serif line-clamp-1">{fav.title}</h3>
                    <p className="text-sm text-stone-500 font-medium mb-4 flex items-center gap-1">
                      <MapPin size={12} className="text-orange-500" /> {fav.restaurant}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-2">
                      <span className="text-lg font-black text-stone-900">Rs. {fav.price}</span>
                      <button
                        onClick={() => setSelectedFav(fav)}
                        className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-orange-600 transition-colors"
                      >
                        Details <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-stone-200">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={32} className="text-stone-300" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif">Empty Collection</h3>
                <p className="text-stone-500 mb-8 max-w-sm mx-auto">Your list of favorites is empty. Start exploring to add delicious finds here.</p>
                <Link to="/deals" className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl hover:bg-orange-600 transition-all font-bold shadow-lg shadow-stone-900/20">
                  Explore Deals <ArrowRight size={18} />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFav && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-stone-100"
            >
              <button
                onClick={() => setSelectedFav(null)}
                className="absolute top-4 right-4 p-2 bg-stone-50 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900"
              >
                <Trash2 className="rotate-45" size={20} />
              </button>

              <div className="mb-6">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide ${selectedFav.type === 'deal' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                  {selectedFav.type === 'deal' ? 'Exclusive Deal' : 'Menu Item'}
                </span>
              </div>

              <h2 className="text-3xl font-black text-stone-900 mb-2 font-serif leading-tight">{selectedFav.title}</h2>
              <p className="text-2xl text-orange-600 font-bold mb-6">Rs. {selectedFav.price}</p>

              <div className="bg-stone-50 p-6 rounded-2xl mb-6">
                <p className="text-stone-600 leading-relaxed font-medium">"{selectedFav.description || "No description available."}"</p>
              </div>

              <div className="flex items-center gap-2 mb-8">
                <MapPin size={18} className="text-orange-500" />
                <span className="text-stone-900 font-bold">{selectedFav.restaurant}</span>
              </div>

              <button
                onClick={() => setSelectedFav(null)}
                className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-xl"
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageTransition>
  );
};

export default UserProfile;
