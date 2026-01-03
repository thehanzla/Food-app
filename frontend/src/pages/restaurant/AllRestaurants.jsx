import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MapPin, Search, Star, ArrowRight, Filter, ChevronLeft, ChevronRight, Store as StoreIcon, CircuitBoard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Animation Variants matching Home.jsx
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

// Mock Featured Data for Banner
const featuredRestaurants = [
  { id: 1, name: "Haveli Restaurant", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1600&q=80", tag: "Heritage Dining" }, // Food Street View
  { id: 2, name: "Spice Bazaar", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80", tag: "Authentic Desi" }, // Elegant ambiance
  { id: 3, name: "Arcadian Cafe", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80", tag: "Modern Fusion" } // Modern Cafe
];

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

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [[pageVal, direction], setPageVal] = useState([0, 0]); // For slide direction

  // Cuisine Options
  const cuisines = ["All", "Desi", "BBQ", "Chinese", "Italian", "Fast Food", "Continental", "Thai", "Seafood"];

  // Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBanner]);

  const paginate = (newDirection) => {
    setPageVal([pageVal + newDirection, newDirection]);
    setCurrentBanner((prev) => (prev + newDirection + featuredRestaurants.length) % featuredRestaurants.length);
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurant/list/external', {
        params: {
          page,
          limit: 9,
          search: searchTerm,
          cuisine: cuisine
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        let list = [];
        if (data.results && data.results.data) {
          list = data.results.data;
        } else if (Array.isArray(data)) {
          list = data;
        }

        const formatted = list.map(item => ({
          _id: item.id,
          businessName: item.name,
          cuisine: item.cuisine,
          location: item.address,
          famousFor: item.description,
          image: item.image,
          isExternal: true
        }));

        setRestaurants(formatted);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRestaurants();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, cuisine]);

  useEffect(() => {
    fetchRestaurants();
  }, [page]);


  return (
    <div className="min-h-screen bg-[#f8f5f0] text-stone-900 overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow z-0">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium z-0">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast z-0"><CircuitBoard size={120} /></div>

      {/* --- SCROLL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 origin-left z-50" style={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5 }} />

      {/* --- FEATURED BANNER CAROUSEL --- */}
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
              src={featuredRestaurants[currentBanner].image}
              alt={featuredRestaurants[currentBanner].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20">
              <div className="container mx-auto">
                <motion.span
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="inline-block px-4 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-widest uppercase mb-4 shadow-lg"
                >
                  Featured Spot
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-5xl md:text-7xl font-black text-white font-serif mb-2 food"
                >
                  {featuredRestaurants[currentBanner].name}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="text-stone-300 text-xl font-medium"
                >
                  {featuredRestaurants[currentBanner].tag}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 right-8 z-30 flex gap-2">
          {featuredRestaurants.map((_, idx) => (
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

      <div className="container mx-auto max-w-7xl px-6 py-20">

        {/* Header Section */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-3 block">Curated Dining</span>
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 tracking-tight font-serif">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Culinary Gems</span>
          </h1>
          <p className="text-stone-500 text-xl font-medium max-w-2xl mx-auto">
            From hidden street food stalls to premium fine dining experiences in Lahore.
          </p>
        </motion.div>

        {/* --- SEARCH & FILTER BAR (NON-STICKY) --- */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white p-6 rounded-[2rem] shadow-xl border border-stone-100 mb-16 relative z-20"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">

            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-red-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search restaurants..."
                className="w-full bg-stone-50 text-stone-900 pl-14 pr-6 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-stone-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Cuisine Filter (Horizontal Scroll) */}
            <div className="flex-1 w-full overflow-hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center md:justify-end">
                {cuisines.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCuisine(c); setPage(1); }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${cuisine === c
                      ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/30'
                      : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* --- RESTAURANT GRID --- */}
        {loading ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-stone-400 font-medium animate-pulse">Consulting the Foodie Brain...</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
            >
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <motion.div
                    key={restaurant._id}
                    variants={fadeInUp}
                    whileHover={{ y: -10 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-100 hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="h-64 bg-stone-200 relative overflow-hidden">
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.businessName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80"; }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-300 bg-stone-100">
                          <StoreIcon className="opacity-50" size={64} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="bg-white/95 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Star size={14} className="text-orange-500 fill-orange-500" />
                          <span className="text-stone-900 text-xs font-black">4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-stone-900 font-serif leading-tight group-hover:text-red-600 transition-colors">{restaurant.businessName}</h3>
                        <p className="text-stone-500 text-sm font-medium mt-1 flex items-center gap-1">
                          <MapPin size={14} className="text-red-500" /> {restaurant.location}
                        </p>
                      </div>

                      <p className="text-stone-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                        Known for: <span className="text-stone-600 font-medium italic">{restaurant.famousFor}</span>
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100 uppercase tracking-wide">
                          {restaurant.cuisine}
                        </span>
                        <Link to={`/menu/${restaurant._id}`} className="inline-flex items-center gap-2 text-stone-900 font-bold hover:gap-3 transition-all">
                          View Menu <ArrowRight size={18} className="text-red-500" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center rounded-[2.5rem] border-2 border-dashed border-stone-200 bg-white">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                    <StoreIcon size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">No hidden gems found?</h3>
                  <p className="text-stone-500">Try searching for a different craving.</p>
                </div>
              )}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                className="flex justify-center items-center gap-4 pb-12"
              >
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-lg border border-stone-100 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-stone-400 font-medium bg-white px-6 py-2 rounded-full border border-stone-100 shadow-sm">
                  Page <span className="text-stone-900 font-bold">{page}</span> of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-white shadow-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllRestaurants;
