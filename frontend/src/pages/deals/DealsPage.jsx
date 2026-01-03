import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Tag, Loader, ArrowRight, Heart, Timer, Percent, Store as StoreIcon, CircuitBoard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Animation Variants (Consistent with Restaurants Page) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const sectionReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.1
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.1
  })
};

// --- Mock Banner Data ---
const featuredDeals = [
  { id: 1, title: "Midnight Munchies", discount: "Flat 50% OFF", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80", subtitle: "Pizza 21 • Valid 12 AM - 4 AM" },
  { id: 2, title: "Royal Platter", discount: "Save Rs. 1500", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80", subtitle: "Haveli Restaurant • Family Deal" },
  { id: 3, title: "Burger Bonanza", discount: "Buy 1 Get 1", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80", subtitle: "Howdy • Limited Time Offer" }
];

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({}); // mapped by unique key string
  const [currentBanner, setCurrentBanner] = useState(0);
  const [[pageVal, direction], setPageVal] = useState([0, 0]);
  const navigate = useNavigate();

  // --- Carousel Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentBanner]);

  const paginate = (newDirection) => {
    setPageVal([pageVal + newDirection, newDirection]);
    setCurrentBanner((prev) => (prev + newDirection + featuredDeals.length) % featuredDeals.length);
  };

  // --- Data Fetching ---
  useEffect(() => {
    fetchDeals();
    checkAuthAndFetchFavorites();
  }, []);

  const checkAuthAndFetchFavorites = async () => {
    // Only attempt to fetch favorites if we think user might be logged in (or just try and fail gracefully)
    try {
      const res = await api.get('/auth/favorites');
      if (res.data.success) {
        const favMap = {};
        res.data.favorites.forEach(f => {
          favMap[`${f.title}-${f.restaurant}`] = true;
        });
        setFavorites(favMap);
      }
    } catch (err) {
      // Allow 401 silently, just means no user
    }
  };

  const fetchDeals = async () => {
    setLoading(true);
    try {
      // Parallel fetch
      const [internalRes, manualRes] = await Promise.all([
        api.get('/restaurant/deals').catch(() => ({ data: { data: [] } })), // Graceful fallback
        api.get('/restaurant/deals/external').catch(() => ({ data: { data: [] } }))
      ]);

      const internalDeals = (internalRes.data?.data || []).map(d => ({
        _id: d._id,
        title: d.title,
        price: parseFloat(d.dealPrice),
        originalPrice: parseFloat(d.originalPrice),
        restaurant: d.restaurantName,
        description: d.description,
        type: 'deal',
        image: d.image ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${d.image.filePath.replace(/\\/g, '/')}` : null,
        isInternal: true
      }));

      const manualDeals = (manualRes.data?.data || []).map((d, i) => ({
        _id: `man-${i}`,
        title: d.title,
        price: d.price,
        originalPrice: d.price * 1.25, // Mock original markup
        restaurant: d.restaurant,
        description: d.description,
        type: 'deal',
        image: d.image,
        isInternal: false
      }));

      setDeals([...manualDeals, ...internalDeals]);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (deal) => {
    try {
      // Optimistic UI
      const key = `${deal.title}-${deal.restaurant}`;
      setFavorites(prev => ({
        ...prev,
        [key]: !prev[key]
      }));

      await api.post('/auth/favorites/toggle', {
        item: {
          itemId: deal._id ? String(deal._id) : '',
          title: deal.title || 'Untitled Deal',
          price: typeof deal.price === 'number' ? deal.price : parseFloat(deal.price) || 0,
          restaurant: deal.restaurant || 'Unknown Restaurant',
          type: 'deal',
          description: deal.description || '',
          image: deal.image || ''
        }
      });
    } catch (error) {
      console.error("Fav Error:", error);
      // Revert on error
      const key = `${deal.title}-${deal.restaurant}`;
      setFavorites(prev => ({
        ...prev,
        [key]: !prev[key]
      }));

      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Rs. 0';
    return `Rs. ${Math.round(parseFloat(price)).toLocaleString('en-PK')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-stone-900 overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow z-0">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium z-0">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast z-0"><CircuitBoard size={120} /></div>

      {/* --- SCROLL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 origin-left z-50" style={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5 }} />

      {/* --- FEATURED BANNER SLIDER --- */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-stone-900">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentBanner}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 }
            }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent z-10" />
            <img
              src={featuredDeals[currentBanner].image}
              alt={featuredDeals[currentBanner].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20">
              <div className="container mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold tracking-widest uppercase mb-4 shadow-lg backdrop-blur-sm bg-opacity-90"
                >
                  <Timer size={14} /> Limited Offer
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-5xl md:text-8xl font-black text-white font-serif mb-4 leading-none food"
                >
                  {featuredDeals[currentBanner].discount}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="text-stone-300 text-2xl font-medium"
                >
                  {featuredDeals[currentBanner].title} <span className="text-stone-500 mx-2">|</span> {featuredDeals[currentBanner].subtitle}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 right-8 z-30 flex gap-2">
          {featuredDeals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newDir = idx > currentBanner ? 1 : -1;
                paginate(newDir);
              }}
              className={`w-12 h-1 rounded-full transition-all ${currentBanner === idx ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <div className="container mx-auto max-w-7xl px-6 py-20">

        {/* Page Header */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-3 block">Daily Savings</span>
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 tracking-tight font-serif">
            Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Offers</span>
          </h1>
          <p className="text-stone-500 text-xl font-medium max-w-2xl mx-auto">
            Discover unbeatable prices on your favorite cravings. Updated daily.
          </p>
        </motion.div>

        {/* Deals Grid */}
        {loading ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-stone-400 font-medium animate-pulse">Finding the best prices...</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {deals.map((deal) => {
              const dealKey = `${deal.title}-${deal.restaurant}`;
              const isFav = favorites[dealKey];
              const discount = deal.originalPrice ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100) : 0;

              return (
                <motion.div
                  key={deal._id}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                >
                  {/* Image Part */}
                  <div className="h-56 bg-stone-200 relative overflow-hidden">
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/e2e8f0/64748b?text=Foodie+AI"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                        <StoreIcon className="opacity-50" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                        <Percent size={12} /> {discount}% OFF
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="text-white">
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">{deal.restaurant}</p>
                        <h3 className="text-lg font-bold font-serif leading-tight">{deal.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Content Part */}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-stone-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                      {deal.description}
                    </p>

                    <div className="pt-4 border-t border-stone-100">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-stone-400 font-bold uppercase mb-1">Price</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-stone-900">{formatPrice(deal.price)}</span>
                            {deal.originalPrice && (
                              <span className="text-sm text-stone-400 line-through decoration-red-400 decoration-2">
                                {formatPrice(deal.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(deal)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isFav ? 'bg-red-50 text-red-600 shadow-inner' : 'bg-stone-100 text-stone-400 hover:bg-stone-900 hover:text-white hover:shadow-lg'}`}
                        >
                          <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}


          </motion.div>
        )}

        {!loading && deals.length === 0 && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-stone-200">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
              <Tag size={32} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">No Deals Found</h2>
            <p className="text-stone-500 mt-2">Check back later for fresh savings.</p>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default DealsPage;