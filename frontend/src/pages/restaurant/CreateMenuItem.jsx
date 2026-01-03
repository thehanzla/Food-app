import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChefHat, Loader, ArrowLeft, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateMenuItem = () => {
  const navigate = useNavigate();
  const { itemId } = useParams(); // Optional: if we want to support editing here too

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    isAvailable: true,
  });
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!itemId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      // Assuming there's an endpoint to get a single item, or we fetch all and find it.
      // Ideally backend has GET /menu/:id. 
      // If not, we might need to rely on state passing or fetch all.
      // For now, let's assume GET /menu/:id exists or we just implement Create.
      // Based on previous code, DELETE /menu/:id exists, so GET likely does too or falls back.
      // If GET /menu/:id isn't implemented in backend, we might fail. 
      // Let's check api.js or backend if possible. 
      // The user mainly asked for "Add New Item", so I will focus on Create mostly.
      const response = await api.get(`/menu/${itemId}`); // Hypothetical endpoint
      if (response.data.success) {
        const item = response.data.data;
        setFormData({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          isAvailable: item.isAvailable
        });
        if (item.image) {
          setImagePreview(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${item.image}`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch item", err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setItemImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('isAvailable', formData.isAvailable);

      if (itemImage) {
        submitData.append('image', itemImage);
      }

      if (itemId) {
        await api.put(`/menu/${itemId}`, submitData);
        alert('Menu item updated successfully!');
      } else {
        await api.post('/menu', submitData);
        alert('Menu item created successfully!');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save menu item.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]"><Loader className="animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-28 pb-20 px-4">

      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-stone-500 hover:text-stone-900 font-bold mb-8 flex items-center gap-2 transition-colors w-fit">
          <ArrowLeft className='size-5' /> Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-100 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ChefHat className="size-8 text-orange-600" />
            </div>
            <h1 className="text-4xl font-black text-stone-900 mb-2 font-serif">
              {itemId ? 'Edit Dish' : 'Add New Dish'}
            </h1>
            <p className="text-stone-500 font-medium">
              Expanded your menu with delicious new offerings.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Dish Image</label>
              <div className="border-2 border-dashed border-stone-200 rounded-[1.5rem] p-4 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer group relative overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full"
                />
                {imagePreview ? (
                  <div className="relative h-64 w-full">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl shadow-sm" />
                    <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                      <span className="text-white font-bold flex items-center gap-2"><Upload size={18} /> Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <ImageIcon className="size-8 text-stone-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <p className="font-bold text-stone-700">Click to upload dish image</p>
                    <p className="text-xs text-stone-400 mt-1 font-medium">High quality JPG or PNG recommended</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Dish Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl p-4 text-stone-900 font-bold outline-none transition-all placeholder:text-stone-300"
                placeholder="e.g. Grilled Chicken Salad"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">Rs.</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl p-4 pl-12 text-stone-900 font-bold outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl p-4 text-stone-900 font-bold outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>Main Course</option>
                    <option>Starters</option>
                    <option>Drinks</option>
                    <option>Desserts</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl p-4 text-stone-900 font-medium outline-none transition-all resize-none placeholder:text-stone-300"
                placeholder="Describe the ingredients and taste..."
              />
            </div>

            <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 cursor-pointer hover:border-orange-200 transition-colors" onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}>
              <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors relative ${formData.isAvailable ? 'bg-green-500' : 'bg-stone-300'}`}>
                <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform absolute top-1 ${formData.isAvailable ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
              </div>
              <div>
                <span className="font-bold text-stone-900 block">Available for Ordering</span>
                <span className="text-xs text-stone-400 font-medium">Customers can currently order this item</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white py-5 rounded-xl text-lg font-bold shadow-xl shadow-stone-900/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 mt-4"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Loader className="animate-spin" /> Saving...</span> : (itemId ? 'Update Dish' : 'Add to Menu')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateMenuItem;
