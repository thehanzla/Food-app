import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, MapPin, Clock } from 'lucide-react';

const RestaurantRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/restaurant/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(response.data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 pt-32 px-6 pb-10 relative">
      <div className="gradient-bg"></div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Registration Requests</h1>
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req._id} className="glass p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ChefHat className="text-yellow-400 size-5" />
                  {req.businessName}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {req.location}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded capitalize">{req.cuisine}</span>
                </div>
                <p className="mt-3 text-gray-300 text-sm">{req.famousFor}</p>
              </div>

              <div className="flex flex-col items-end justify-center min-w-[150px]">
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                  {req.status}
                </span>
                <span className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Clock size={12} /> {new Date(req.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantRequests;