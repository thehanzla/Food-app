import React, { useState } from 'react';
import { api } from '../../services/api';
import { Tag, Loader, ArrowLeft, Image as ImageIcon, CheckCircle, Upload } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateDeal = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    dealPrice: '',
    expiresAt: ''
  });
  const [dealImage, setDealImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDealImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setDealImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('originalPrice', formData.originalPrice);
      submitData.append('dealPrice', formData.dealPrice);
      submitData.append('expiresAt', formData.expiresAt);
      if (dealImage) {
        submitData.append('image', dealImage);
      }

      await api.post('/restaurant/deals', submitData);

      alert('Deal published successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create deal.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
          {/* Decorative Circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Tag className="size-8 text-orange-600" />
            </div>
            <h1 className="text-4xl font-black text-stone-900 mb-2 font-serif">
              Create New Deal
            </h1>
            <p className="text-stone-500 font-medium">
              Attract more customers with an exclusive, limited-time offer.
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
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Hero Image</label>
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
                    <p className="font-bold text-stone-700">Click to upload deal image</p>
                    <p className="text-xs text-stone-400 mt-1 font-medium">High quality JPG or PNG recommended</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Deal Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl p-4 text-stone-900 font-bold outline-none transition-all placeholder:text-stone-300"
                placeholder="e.g. 50% Off Special Platter"
              />
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
                placeholder="What makes this deal irresistible?"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Original Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs.</span>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl p-4 pl-12 text-stone-900 font-bold outline-none transition-all"
                    placeholder="2000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Deal Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">Rs.</span>
                  <input
                    type="number"
                    name="dealPrice"
                    value={formData.dealPrice}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full bg-orange-50/50 border-2 border-orange-100 focus:bg-white focus:border-orange-300 rounded-xl p-4 pl-12 text-orange-700 font-bold outline-none transition-all"
                    placeholder="999"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Expiration <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  required
                  className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl p-4 text-stone-900 font-bold outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white py-5 rounded-xl text-lg font-bold shadow-xl shadow-stone-900/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 mt-4"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Loader className="animate-spin" /> Publishing...</span> : 'Publish Deal Now'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateDeal;