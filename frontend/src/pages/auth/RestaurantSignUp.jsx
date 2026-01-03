import React, { useState } from 'react';
import { Upload, ChefHat, MapPin, Star, ArrowLeft, Loader, CircuitBoard } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const RestaurantSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    cuisine: '',
    location: '',
    famousFor: ''
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('businessName', formData.businessName);
      submitData.append('cuisine', formData.cuisine);
      submitData.append('location', formData.location);
      submitData.append('famousFor', formData.famousFor);

      if (documentFile) {
        submitData.append('document', documentFile);
      }

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // FIX: Do NOT manually set Content-Type for FormData. 
      // Axios sets it automatically with the correct boundary.
      const response = await api.post('/restaurant/request', submitData);

      if (response.data.success) {
        alert('Request submitted! Awaiting approval.');
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error submitting request.';

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        // Clear local data to force clean state
        localStorage.removeItem('userData');
        navigate('/login');
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative pt-32 pb-10 px-4 overflow-hidden bg-[#f8f5f0]">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast"><CircuitBoard size={120} /></div>



      <div className="max-w-3xl mx-auto relative z-10">
        <Link to="/register" className="inline-flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors font-bold">
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-100">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-stone-900/30">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-stone-900 mb-3 font-serif">
              Partner with FoodieAI
            </h1>
            <p className="text-stone-500 font-medium">
              Join Lahore's most exclusive culinary network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-stone-50 border-2 border-transparent focus:border-stone-900 focus:bg-white rounded-2xl p-4 text-stone-900 outline-none transition-all font-bold placeholder:text-stone-300"
                  placeholder="e.g. The Golden Spoon"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Cuisine Type *</label>
                <div className="relative">
                  <select
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-stone-900 focus:bg-white rounded-2xl p-4 text-stone-900 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="" className="text-stone-300">Select Cuisine Category</option>
                    {["Pakistani", "Chinese", "Italian", "Continental", "Fast Food", "BBQ", "Desserts", "Cafe", "Other"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <ArrowLeft className="-rotate-90" size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">
                <MapPin size={12} className="inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full bg-stone-50 border-2 border-transparent focus:border-stone-900 focus:bg-white rounded-2xl p-4 text-stone-900 outline-none transition-all font-bold placeholder:text-stone-300"
                placeholder="Full street address of your establishment"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">
                <Star size={12} className="inline mr-1" />
                Famous For *
              </label>
              <textarea
                name="famousFor"
                value={formData.famousFor}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full bg-stone-50 border-2 border-transparent focus:border-stone-900 focus:bg-white rounded-2xl p-4 text-stone-900 outline-none transition-all font-bold resize-none placeholder:text-stone-300"
                placeholder="Signature dishes, unique ambiance, or special experiences..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 transition-all group cursor-pointer relative overflow-hidden">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-center relative z-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-stone-900" />
                  </div>
                  <span className="block font-bold text-stone-900 group-hover:text-orange-600 transition-colors">Business License</span>
                  <span className="block text-[10px] uppercase font-bold text-stone-400 mt-1 tracking-wider">PDF/IMG (Max 5MB)</span>
                  {documentFile && (
                    <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {documentFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 transition-all group cursor-pointer relative overflow-hidden">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-center relative z-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-stone-900" />
                  </div>
                  <span className="block font-bold text-stone-900 group-hover:text-orange-600 transition-colors">Cover Photo</span>
                  <span className="block text-[10px] uppercase font-bold text-stone-400 mt-1 tracking-wider">High Quality (Max 5MB)</span>
                  {imageFile && (
                    <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {imageFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-stone-900/20 hover:bg-orange-600 hover:shadow-orange-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader className="animate-spin" /> : <>Submit Application <ArrowLeft className="rotate-180" size={20} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignUp;