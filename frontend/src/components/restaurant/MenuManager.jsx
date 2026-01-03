import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Loader, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MenuManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/menu/items/my');
      setItems(response.data.data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  if (loading) return <div className="text-center py-10"><Loader className="animate-spin text-orange-500 mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-stone-900 font-serif">Menu Management</h3>
          <p className="text-stone-500 font-medium">Manage your dishes and availability.</p>
        </div>
        <Link
          to="/restaurant/menu/create"
          className="bg-stone-900 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-stone-900/20 active:scale-95"
        >
          <Plus size={18} /> Add Dish
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
        {items.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-[2rem] border border-dashed border-stone-200 text-stone-400">
            <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold text-lg">No Items Yet</p>
            <p className="text-sm">Start by adding your signature dishes.</p>
          </div>
        ) : items.map((item, idx) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="p-5 bg-white rounded-[2rem] flex gap-5 border border-stone-100 hover:border-orange-200 hover:shadow-xl transition-all group"
          >
            {item.image ? (
              <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${item.image}`} className="w-24 h-24 object-cover rounded-2xl bg-stone-100 shadow-sm" alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=Menu"; }} />
            ) : (
              <div className="w-24 h-24 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 border border-stone-100">
                <ChefHat size={32} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-stone-900 text-lg font-serif leading-tight">{item.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{item.category}</span>
                </div>
                <span className="text-orange-600 font-black text-lg">Rs. {item.price}</span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2 mt-2 leading-relaxed font-medium">{item.description}</p>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${item.isAvailable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {item.isAvailable ? 'Available' : 'Sold Out'}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/restaurant/menu/edit/${item._id}`} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors"><Edit2 size={16} /></Link>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MenuManager;
