import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RefreshCw, Check, X, Clock, User, Hash } from 'lucide-react';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/restaurant');
      setOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refresh immediately
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <div className="text-center py-6 text-gray-400">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Incoming Orders</h3>
        <button onClick={fetchOrders} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white"><RefreshCw size={20} /></button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-10 border border-dashed border-gray-700 rounded-xl text-gray-500">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className={`p-4 rounded-xl border ${order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-slate-800 border-white/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${order.status === 'pending' ? 'bg-yellow-500 text-slate-900' :
                      order.status === 'confirmed' ? 'bg-green-500 text-white' :
                        order.status === 'rejected' ? 'bg-red-500 text-white' :
                          'bg-gray-600 text-gray-300'
                      }`}>{order.status}</span>
                    <span className="text-gray-400 text-xs flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <Hash size={16} className="text-indigo-400" /> Order #{order._id.slice(-6)}
                  </h4>
                  <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                    <User size={14} /> {order.customerName || 'Guest'} (Table: {order.tableNumber || 'N/A'})
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xl font-bold text-yellow-400">Rs. {order.totalAmount}</span>
                  <span className="text-xs text-gray-500">{order.items.length} Items</span>
                </div>
              </div>

              <div className="bg-black/20 p-3 rounded-lg mb-4 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-300">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Payment Details Section */}
              <div className="flex flex-col gap-1 mb-4 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Payment Method:</span>
                  <span className="font-bold text-white uppercase">{order.paymentMethod || 'Cash'}</span>
                </div>
                {order.discountApplied > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount Applied:</span>
                    <span>- Rs. {order.discountApplied}</span>
                  </div>
                )}
                {order.finalAmount && order.finalAmount !== order.totalAmount && (
                  <div className="flex justify-between text-yellow-400 font-bold border-t border-white/5 pt-1 mt-1">
                    <span>Final Total:</span>
                    <span>Rs. {order.finalAmount}</span>
                  </div>
                )}
              </div>

              {order.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => updateStatus(order._id, 'confirmed')} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2">
                    <Check size={18} /> Accept
                  </button>
                  <button onClick={() => updateStatus(order._id, 'rejected')} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2">
                    <X size={18} /> Reject
                  </button>
                </div>
              )}
              {order.status === 'confirmed' && (
                <button onClick={() => updateStatus(order._id, 'completed')} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm">
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
