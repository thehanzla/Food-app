import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ShoppingCart, Plus, Minus, Utensils, X, CheckCircle, ChefHat, Loader, Sparkles, Receipt, CreditCard, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const PublicMenu = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState({}); // { itemId: { item, quantity } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'details', 'success'
  const [orderDetails, setOrderDetails] = useState({ name: '', tableNumber: '' });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
  const [discounts, setDiscounts] = useState({ card: 0, cash: 0 });

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      if (restaurantId.startsWith('ext-') || restaurantId.startsWith('mock-') || restaurantId.startsWith('man-')) {
        const response = await api.get(`/restaurant/external/${restaurantId}`);
        if (response.data.success) {
          const data = response.data.data;
          const mappedMenu = (data.menu || []).map((m, idx) => ({
            _id: `menu-${idx}`,
            name: m.name,
            price: m.price,
            description: m.description,
            category: m.category || "Specials",
            image: null
          }));
          setMenuItems(mappedMenu);
          setRestaurant({ name: data.name, cuisine: data.cuisine, isExternal: true });
        }
      } else {
        const response = await api.get(`/menu/${restaurantId}`);
        const fetchedItems = response.data.data || [];
        let allItems = [...fetchedItems];
        setRestaurant(response.data.restaurant);
        if (response.data.restaurant.discounts) setDiscounts(response.data.restaurant.discounts);

        if (response.data.deals && response.data.deals.length > 0) {
          const mappedDeals = response.data.deals.map(deal => ({
            _id: deal._id,
            name: deal.title,
            description: deal.description,
            price: deal.dealPrice,
            originalPrice: deal.originalPrice,
            image: deal.image ? deal.image.filePath : null,
            category: 'Active Deals',
            isDeal: true
          }));
          allItems = [...mappedDeals, ...allItems];
        }
        setMenuItems(allItems);
      }
    } catch (error) {
      setError("Restaurant not found or currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item._id]: { item, quantity: (prev[item._id]?.quantity || 0) + 1 }
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const currentQty = prev[itemId]?.quantity || 0;
      if (currentQty <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...prev[itemId], quantity: currentQty - 1 } };
    });
  };

  const calculateTotal = () => Object.values(cart).reduce((total, { item, quantity }) => total + (item.price * quantity), 0);
  const calculateDiscount = () => {
    const subtotal = calculateTotal();
    const discountPercent = paymentMethod === 'cash' ? discounts.cash : discounts.card;
    return Math.round(subtotal * (discountPercent / 100));
  };
  const calculateFinalTotal = () => calculateTotal() - calculateDiscount();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    const items = Object.values(cart).map(({ item, quantity }) => ({ menuItem: item._id, quantity }));

    try {
      await api.post('/orders', {
        restaurantId,
        items,
        customerName: orderDetails.name,
        tableNumber: orderDetails.tableNumber,
        totalAmount: calculateTotal(),
        paymentMethod,
        discountApplied: calculateDiscount(),
        finalAmount: calculateFinalTotal()
      });
      setCheckoutStep('success');
      setCart({});
    } catch (error) {
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
  const categories = ['All', ...uniqueCategories.filter(c => c === 'Active Deals'), ...uniqueCategories.filter(c => c !== 'Active Deals').sort()];
  const filteredItems = selectedCategory === 'All' ? menuItems : menuItems.filter(item => item.category === selectedCategory);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]"><Loader className="animate-spin text-orange-500" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-stone-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-32 text-stone-900 font-sans selection:bg-orange-100">
      {/* --- SCROLL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 origin-left z-50" style={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5 }} />

      {/* --- Sticky Header --- */}
      <motion.div
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md border-b border-stone-200 z-30 sticky top-0 shadow-sm"
      >
        <div className="px-6 py-4 max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-stone-900 flex items-center gap-3 font-serif tracking-tight leading-none">
              <div className="bg-gradient-to-br from-red-600 to-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-900/20">
                <Utensils className="size-5" />
              </div>
              {restaurant?.name}
            </h1>
            <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1 ml-1">{restaurant?.cuisine} • Digital Menu</p>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="px-6 pb-4 overflow-x-auto flex gap-3 no-scrollbar max-w-4xl mx-auto mask-linear-fade">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all transform active:scale-95 ${selectedCategory === cat
                ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20'
                : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Deals Banner */}
      {(discounts.cash > 0 || discounts.card > 0) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-emerald-50 border-b border-emerald-100 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-emerald-600 animate-pulse" />
            <span>
              {discounts.cash > 0 && `Save ${discounts.cash}% on Cash`}
              {discounts.cash > 0 && discounts.card > 0 && ' | '}
              {discounts.card > 0 && `Save ${discounts.card}% on Card`}
            </span>
          </div>
        </motion.div>
      )}

      {/* --- Menu Grid --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-5 max-w-4xl mx-auto space-y-4 mt-2"
      >
        {filteredItems.length === 0 ? (
          <div className="text-center text-stone-400 mt-20 font-serif italic text-lg opacity-60">
            No items found in this section.
          </div>
        ) : (
          filteredItems.map(item => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              className="bg-white rounded-[1.5rem] p-4 flex gap-4 border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image */}
              <div className="shrink-0">
                {item.image ? (
                  <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${item.image}`} alt={item.name} className="w-24 h-24 object-cover rounded-2xl shadow-sm bg-stone-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/e7e5e4/a8a29e?text=Dishes"; }} />
                ) : (
                  <div className="w-24 h-24 bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100">
                    <ChefHat className="text-stone-300" size={32} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-stone-900 font-serif leading-tight pr-2">{item.name}</h3>
                    <div className="text-right">
                      {item.originalPrice && (
                        <span className="block text-[10px] text-stone-400 line-through decoration-red-400">Rs. {item.originalPrice}</span>
                      )}
                      <span className="block text-orange-600 font-black text-sm">Rs. {item.price}</span>
                    </div>
                  </div>
                  <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                </div>

                {/* Add/Remove Actions */}
                <div className="flex justify-end mt-3">
                  {!restaurant?.isExternal ? (
                    cart[item._id] ? (
                      <div className="flex items-center bg-stone-900 rounded-xl px-1 shadow-lg shadow-stone-900/20 animate-in zoom-in-50 duration-200">
                        <button onClick={() => removeFromCart(item._id)} className="p-2 text-stone-400 hover:text-white transition-colors"><Minus size={14} /></button>
                        <span className="w-6 text-center text-white font-bold text-sm tabular-nums">{cart[item._id].quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-2 text-white hover:text-orange-400 transition-colors"><Plus size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="bg-stone-50 text-stone-900 border border-stone-200 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all active:scale-95">
                        Add
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50 px-3 py-1 rounded-full">Unavailable</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {Object.keys(cart).length > 0 && !showCart && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6 pointer-events-none"
          >
            <button
              onClick={() => { setShowCart(true); setCheckoutStep('cart'); }}
              className="pointer-events-auto bg-stone-900 text-white pl-5 pr-8 py-4 rounded-full shadow-2xl shadow-stone-900/40 flex items-center gap-4 font-bold active:scale-95 transition-transform"
            >
              <div className="bg-orange-500 text-white text-xs w-8 h-8 rounded-full flex items-center justify-center font-black">
                {Object.values(cart).reduce((acc, curr) => acc + curr.quantity, 0)}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total</span>
                <span className="text-lg">Rs. {calculateTotal()}</span>
              </div>
              <div className="w-px h-8 bg-stone-700 mx-2" />
              <div className="flex items-center gap-2">
                <span>View Bucket</span>
                <ShoppingCart size={18} className="text-orange-500" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white w-full sm:max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 flex flex-col relative shadow-2xl"
            >
              <button onClick={() => setShowCart(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 bg-stone-50 p-3 rounded-full transition-colors"><X size={20} /></button>

              {checkoutStep === 'success' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <CheckCircle className="size-12 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-black text-stone-900 font-serif">Order Placed!</h2>
                  <p className="text-stone-500 mt-2 mb-8 font-medium">Sit tight! Your delicious meal is being processed.</p>
                  <div className="bg-stone-50 p-6 rounded-2xl w-full mb-8 border border-stone-100">
                    <p className="text-xs text-stone-400 uppercase font-black tracking-widest mb-2">Order ID</p>
                    <p className="text-4xl font-mono text-orange-500 font-bold tracking-widest">#8X29</p>
                  </div>
                  <button onClick={() => setShowCart(false)} className="w-full bg-stone-900 hover:bg-stone-800 text-white px-6 py-4 rounded-xl font-bold transition-colors">Okay, Got it</button>
                </div>
              ) : checkoutStep === 'details' ? (
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-black text-stone-900 mb-6 font-serif">Checkout Details</h2>
                  <form onSubmit={handlePlaceOrder} className="space-y-6 flex-1 overflow-y-auto pr-2">
                    <div className="space-y-4">
                      <div>
                        <label className="text-stone-500 text-xs font-bold uppercase tracking-wider ml-1 mb-2 block">Your Name</label>
                        <input required placeholder="Who's eating?" className="w-full bg-stone-50 border-2 border-transparent focus:border-orange-200 focus:bg-white rounded-2xl p-4 text-stone-900 outline-none transition-all font-bold" value={orderDetails.name} onChange={e => setOrderDetails({ ...orderDetails, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-stone-500 text-xs font-bold uppercase tracking-wider ml-1 mb-2 block">Table No.</label>
                        <input required placeholder="#" className="w-full bg-stone-50 border-2 border-transparent focus:border-orange-200 focus:bg-white rounded-2xl p-4 text-stone-900 outline-none transition-all font-bold" value={orderDetails.tableNumber} onChange={e => setOrderDetails({ ...orderDetails, tableNumber: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className="text-stone-500 text-xs font-bold uppercase tracking-wider ml-1 mb-2 block">Payment Method</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setPaymentMethod('cash')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'cash' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                          <Banknote size={24} />
                          <span className="font-bold text-sm">Cash</span>
                          {discounts.cash > 0 && <span className="bg-white text-orange-600 text-[10px] font-black px-2 py-0.5 rounded shadow-sm">SAVE {discounts.cash}%</span>}
                        </button>
                        <button type="button" onClick={() => setPaymentMethod('card')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                          <CreditCard size={24} />
                          <span className="font-bold text-sm">Card</span>
                          {discounts.card > 0 && <span className="bg-white text-orange-600 text-[10px] font-black px-2 py-0.5 rounded shadow-sm">SAVE {discounts.card}%</span>}
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-5 rounded-2xl space-y-3 border border-stone-100">
                      <div className="flex justify-between text-stone-500 font-bold text-sm"><span>Subtotal</span><span>Rs. {calculateTotal()}</span></div>
                      {calculateDiscount() > 0 && <div className="flex justify-between text-emerald-600 font-bold text-sm"><span>Discount</span><span>- Rs. {calculateDiscount()}</span></div>}
                      <div className="flex justify-between text-stone-900 font-black text-xl pt-3 border-t border-stone-200"><span>Total</span><span>Rs. {calculateFinalTotal()}</span></div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setCheckoutStep('cart')} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-4 rounded-xl font-bold transition-colors">Back</button>
                      <button type="submit" disabled={placingOrder} className="flex-[2] bg-stone-900 text-white hover:bg-orange-600 py-4 rounded-xl font-bold transition-all shadow-xl shadow-stone-900/20 disabled:opacity-50">
                        {placingOrder ? "Processing..." : `Confirm Order`}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-stone-900 mb-6 font-serif flex items-center gap-2">
                    Your Bucket <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-sans font-bold">{Object.keys(cart).length}</span>
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {Object.values(cart).map(({ item, quantity }) => (
                      <div key={item._id} className="flex justify-between items-center bg-white p-2 rounded-2xl border border-stone-50">
                        <div className="flex items-center gap-4">
                          <div className="bg-stone-100 w-12 h-12 flex items-center justify-center rounded-xl text-stone-900 font-black">{quantity}x</div>
                          <div>
                            <p className="font-bold text-stone-900 text-sm">{item.name}</p>
                            <p className="text-xs text-stone-400 font-bold">Rs. {item.price * quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg">
                          <button onClick={() => removeFromCart(item._id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-white rounded-md transition-all"><Minus size={14} /></button>
                          <button onClick={() => addToCart(item)} className="p-2 text-stone-400 hover:text-green-500 hover:bg-white rounded-md transition-all"><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-stone-100 space-y-4">
                    <div className="flex justify-between text-stone-900 text-2xl font-black font-serif"><span>Total</span><span>Rs. {calculateTotal()}</span></div>
                    <button onClick={() => setCheckoutStep('details')} className="w-full bg-stone-900 text-white hover:bg-orange-600 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-stone-900/20">Proceed to Checkout</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicMenu;
