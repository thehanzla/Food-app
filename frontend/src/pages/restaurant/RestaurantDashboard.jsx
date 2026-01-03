import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Clock, CheckCircle, XCircle, Info, Zap, Loader, Tag, ArrowRight, Trash2, Menu, Grid, List, QrCode, Settings, Store, CircuitBoard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import MenuManager from '../../components/restaurant/MenuManager';
import OrderManager from '../../components/restaurant/OrderManager';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const isVerified = user?.restaurantDetails?.isVerified;
  const restaurantId = user?._id || user?.id;
  const menuLink = restaurantId ? `${window.location.origin}/menu/${restaurantId}` : '';

  useEffect(() => {
    if (user) {
      fetchRequestStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRequestStatus = async () => {
    setLoading(true);

    if (user?.role === 'restaurant' && isVerified) {
      setRequestStatus('approved');
      setRestaurantData(user.restaurantDetails);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/restaurant/user-request-status');
      const latestRequest = response.data.data;

      if (latestRequest) {
        setRequestStatus(latestRequest.status);
        setAdminNotes(latestRequest.adminNotes);
        setRestaurantData(latestRequest);
      } else {
        setRequestStatus('none');
      }
    } catch (error) {
      console.error("Error fetching request status:", error.response || error);
      if (error.response?.status === 401) {
        setRequestStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const MyDealsList = () => {
    const [myDeals, setMyDeals] = useState([]);
    const [dealsLoading, setDealsLoading] = useState(true);

    useEffect(() => {
      fetchMyDeals();
    }, []);

    const fetchMyDeals = async () => {
      setDealsLoading(true);
      try {
        const response = await api.get('/restaurant/deals/my');
        setMyDeals(response.data.data);
      } catch (error) {
        console.error("Error fetching my deals:", error);
      } finally {
        setDealsLoading(false);
      }
    };

    const handleDelete = async (dealId) => {
      if (window.confirm("Are you sure?")) {
        try {
          await api.delete(`/restaurant/deals/${dealId}`);
          fetchMyDeals();
        } catch (error) {
          console.error("Error deleting deal:", error);
        }
      }
    };

    if (dealsLoading) return <div className="text-center py-6"><Loader className="animate-spin text-orange-500 size-8 mx-auto" /></div>;

    const formatPrice = (price) => {
      if (price === undefined || price === null) return 'Rs. 0';
      return `Rs. ${parseFloat(price).toLocaleString('en-PK')}`;
    };

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2 font-serif">
            <Tag className="text-orange-500" /> Active Deals
          </h3>
          <Link to="/create-deal" className="bg-stone-900 text-white px-5 py-2 rounded-xl text-sm font-bold transition-transform hover:scale-105 shadow-md shadow-stone-900/20">
            + New Deal
          </Link>
        </div>

        {myDeals.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl text-center text-stone-400 border border-dashed border-stone-200">
            You have no active deals.
          </div>
        ) : (
          <div className="space-y-4">
            {myDeals.map((deal) => (
              <div key={deal._id} className="p-5 bg-white rounded-2xl border border-stone-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="text-lg font-bold text-stone-900 font-serif">{deal.title}</p>
                  <div className="text-sm text-stone-500 flex items-center gap-3 mt-1">
                    <span className="text-orange-600 font-black">{formatPrice(deal.dealPrice)}</span>
                    <span className="line-through text-stone-400 font-medium decoration-red-400">{formatPrice(deal.originalPrice)}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(deal._id)} className="text-stone-300 hover:text-red-600 hover:bg-stone-50 p-2 rounded-xl transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const PendingView = () => (
    <div className="text-center p-12 bg-white rounded-[2.5rem] border border-stone-100 max-w-2xl mx-auto mt-10 shadow-2xl">
      <Clock className="size-20 text-orange-500 mx-auto animate-pulse mb-6" />
      <h2 className="text-4xl font-black text-stone-900 mb-2 font-serif">Application Pending</h2>
      <p className="text-stone-500 text-lg font-medium">Your business application is currently under review by our team.</p>
    </div>
  );

  const RejectedView = () => (
    <div className="text-center p-12 bg-white rounded-[2.5rem] border border-stone-100 max-w-2xl mx-auto mt-10 shadow-2xl">
      <XCircle className="size-20 text-red-500 mx-auto mb-6" />
      <h2 className="text-4xl font-black text-stone-900 mb-2 font-serif">Application Rejected</h2>
      <p className="text-stone-500 text-lg mb-8 font-medium">We regret to inform you that your request was not approved.</p>
      {adminNotes && (
        <div className="mb-8 p-6 bg-red-50 rounded-2xl border border-red-100 text-left">
          <h4 className="text-red-700 font-bold mb-2 uppercase tracking-wide text-xs">Reason for Rejection:</h4>
          <p className="text-red-600 font-medium">{adminNotes}</p>
        </div>
      )}
      <Link to="/restaurant-signup" className="bg-stone-900 text-white px-8 py-3 rounded-xl inline-flex items-center gap-2 shadow-xl shadow-stone-900/20 font-bold hover:bg-orange-600 transition-colors">
        <ArrowRight size={18} /> Resubmit Application
      </Link>
    </div>
  );

  const SettingsView = () => {
    const [discounts, setDiscounts] = useState({
      cash: restaurantData?.discounts?.cash || 0,
      card: restaurantData?.discounts?.card || 0
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const response = await api.put('/restaurant/settings', { discounts });
        setRestaurantData({ ...restaurantData, discounts: response.data.data.discounts });
        alert("Settings updated successfully!");
      } catch (error) {
        console.error("Error updating settings:", error);
        alert("Failed to update settings.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl">
        <h2 className="text-3xl font-bold text-stone-900 mb-8 flex items-center gap-3 font-serif">
          <Settings className="text-orange-500" /> Payment & Discounts
        </h2>
        <form onSubmit={handleSave} className="space-y-6 max-w-lg">
          <div className="grid gap-6">
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <label className="text-stone-500 text-xs font-bold uppercase tracking-wider ml-1 mb-2 block">Cash Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-900 focus:border-orange-500 focus:ring-0 outline-none transition-all font-bold text-xl"
                value={discounts.cash}
                onChange={e => setDiscounts({ ...discounts, cash: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-stone-400 mt-2 font-medium">Applied when paying with cash.</p>
            </div>
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <label className="text-stone-500 text-xs font-bold uppercase tracking-wider ml-1 mb-2 block">Card Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-900 focus:border-orange-500 focus:ring-0 outline-none transition-all font-bold text-xl"
                value={discounts.card}
                onChange={e => setDiscounts({ ...discounts, card: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-stone-400 mt-2 font-medium">Applied when paying with card.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-stone-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-stone-900/20 hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>
      </motion.div>
    );
  };

  const DashboardContent = () => (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        {[
          { id: 'overview', icon: Grid, label: 'Overview' },
          { id: 'menu', icon: Menu, label: 'Menu Items' },
          { id: 'orders', icon: List, label: 'Orders' },
          { id: 'qrcode', icon: QrCode, label: 'QR Code' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-6 py-4 rounded-2xl font-bold flex items-center gap-4 transition-all ${activeTab === tab.id
              ? 'bg-stone-900 text-white shadow-xl shadow-stone-900/20 scale-105'
              : 'bg-white text-stone-500 border border-stone-100 hover:bg-stone-50 hover:text-stone-900'}`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'text-orange-500' : ''} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="bg-stone-900 p-4 rounded-2xl text-white shadow-lg shadow-stone-900/40">
                      <Store size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-stone-900 font-serif leading-none mb-1">{restaurantData.businessName}</h2>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-stone-500 font-bold text-sm uppercase tracking-wide">Restaurant is Live</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 relative z-10">
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-xs text-stone-400 uppercase font-black tracking-widest mb-1">Cuisine Type</p>
                      <p className="text-xl font-bold text-stone-900 font-serif">{restaurantData.cuisine}</p>
                    </div>
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-xs text-stone-400 uppercase font-black tracking-widest mb-1">Located At</p>
                      <p className="text-xl font-bold text-stone-900 font-serif">{restaurantData.location}</p>
                    </div>
                  </div>
                </div>
                <MyDealsList />
              </div>
            )}

            {activeTab === 'menu' && <MenuManager />}

            {activeTab === 'orders' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl">
                <OrderManager />
              </div>
            )}

            {activeTab === 'qrcode' && (
              <div className="bg-white p-12 rounded-[2.5rem] border border-stone-100 text-center shadow-xl">
                <h2 className="text-4xl font-black text-stone-900 mb-4 font-serif">Digital Menu QR</h2>
                <p className="text-stone-500 mb-10 text-lg max-w-md mx-auto">Scan this code to instantly access your restaurant's public menu.</p>

                <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl shadow-stone-200 border border-stone-100 mb-10">
                  <QRCodeCanvas id="qr-code-canvas" value={menuLink} size={256} />
                </div>

                <div className="bg-stone-50 p-6 rounded-2xl max-w-lg mx-auto border border-stone-100">
                  <p className="text-xs text-stone-400 mb-2 font-black uppercase tracking-widest">Public Menu Link</p>
                  <a href={menuLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-mono text-sm hover:underline break-all font-bold">
                    {menuLink}
                  </a>
                </div>

                <div className="flex justify-center gap-4 mt-10">
                  <button onClick={() => {
                    const canvas = document.getElementById('qr-code-canvas');
                    if (canvas) {
                      const pngUrl = canvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.href = pngUrl;
                      downloadLink.download = `${restaurantData?.businessName?.replace(/\s+/g, '-').toLowerCase() || 'restaurant'}-qr-code.png`;
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }
                  }} className="bg-orange-600 text-white px-8 py-3 rounded-xl shadow-xl shadow-orange-600/20 font-bold hover:bg-orange-700 transition-colors flex items-center gap-2">
                    <ArrowRight className="rotate-90" size={18} /> Download
                  </button>
                  <button onClick={() => window.print()} className="bg-stone-900 text-white px-8 py-3 rounded-xl shadow-xl shadow-stone-900/20 font-bold hover:bg-stone-800 transition-colors">
                    Print QR Code
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f5f0] relative pt-28 px-6 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow z-0">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium z-0">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast z-0"><CircuitBoard size={120} /></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-12 text-center tracking-tight font-serif">Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Dashboard</span></h1>

        {loading ? (
          <div className="text-center py-32"><Loader className="animate-spin text-orange-500 size-12 mx-auto" /></div>
        ) : (
          <>
            {requestStatus === 'pending' && <PendingView />}
            {requestStatus === 'rejected' && <RejectedView />}
            {requestStatus === 'approved' && <DashboardContent />}

            {requestStatus === 'none' && (
              <div className="text-center p-12 bg-white rounded-[2.5rem] border border-stone-100 max-w-2xl mx-auto shadow-2xl">
                <Info className="size-20 text-blue-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-stone-900 mb-4 font-serif">Join the Network</h2>
                <p className="text-stone-500 text-lg mb-8">You haven't submitted a restaurant request yet. Join thousands of top restaurants on FoodieAI.</p>
                <Link to="/restaurant-signup" className="bg-stone-900 text-white mt-4 inline-flex px-8 py-4 rounded-xl shadow-xl shadow-stone-900/20 font-bold hover:bg-orange-600 transition-colors">
                  Submit Application
                </Link>
              </div>
            )}

            {requestStatus === 'error' && (
              <div className="text-center text-red-500 mt-20 font-bold text-xl">Error loading dashboard. Please refresh.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
