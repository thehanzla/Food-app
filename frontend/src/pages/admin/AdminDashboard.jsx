import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Users, Clock, CheckCircle, XCircle, Search, Shield, FileText,
  ChefHat, Download, Loader, Briefcase, TrendingUp, CircuitBoard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchDashboardData(); }, [statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, reqRes] = await Promise.all([
        api.get('/restaurant/dashboard/stats'),
        api.get(`/restaurant/requests?status=${statusFilter}`)
      ]);

      setStats(statsRes.data.data);
      setRequests(reqRes.data.data);

    } catch (error) {
      console.error("Error fetching admin data:", error.response || error);
      if (error.response?.status === 403) {
        alert("Access Denied: You must be logged in as an Admin.");
      } else if (error.response?.status === 401) {
        alert("Session Expired or Unauthorized. Please log in.");
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    const notes = status === 'rejected' ? prompt('Rejection reason:') : 'Approved by admin';
    if (status === 'rejected' && !notes) return;
    try {
      await api.put(`/restaurant/requests/${requestId}`,
        { status, adminNotes: notes }
      );
      fetchDashboardData(); setShowModal(false);
    } catch (error) { alert('Error updating request'); }
  };

  const downloadDocument = (doc) => {
    if (doc && doc.filePath) {
      const normalizePath = doc.filePath.replace(/\\/g, "/");
      const link = document.createElement('a');
      link.href = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${normalizePath}`;
      link.setAttribute('download', doc.fileName || 'download');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredRequests = requests.filter(r =>
    r.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.fullName && r.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      approved: 'bg-green-50 text-green-600 border-green-200',
      rejected: 'bg-red-50 text-red-600 border-red-200'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-stone-900 relative overflow-hidden pt-28 px-6 pb-20 font-sans">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast"><CircuitBoard size={120} /></div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-10 tracking-tight font-serif">Admin <span className="text-orange-600">Control Panel</span></h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {[
            { label: 'Total Requests', val: stats.totalRequests, icon: Briefcase, color: 'text-stone-600', bg: 'bg-stone-100' },
            { label: 'Pending', val: stats.pendingRequests, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Approved', val: stats.approvedRequests, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Rejected', val: stats.rejectedRequests, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Restaurants', val: stats.totalRestaurants, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-stone-900">{stat.val || 0}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl overflow-hidden">

          {/* Toolbar */}
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-50/50">
            <h2 className="text-xl font-bold flex items-center gap-2 font-serif">
              <Users size={20} className="text-orange-500" /> Registration Requests
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white border border-stone-200 focus:border-orange-500 focus:ring-0 outline-none transition-all font-bold text-stone-700 placeholder:text-stone-300"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl text-sm bg-white border border-stone-200 font-bold text-stone-700 outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 text-stone-400 uppercase text-[10px] font-black tracking-widest leading-none border-b border-stone-100">
                <tr>
                  <th className="px-8 py-5">Restaurant</th>
                  <th className="px-6 py-5">Owner</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {requests.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-stone-400 font-bold italic">No requests found.</td></tr>
                ) :
                  filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors">{req.businessName}</div>
                        <div className="text-stone-400 text-xs font-medium">{req.location}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-stone-700 text-sm">{req.user?.fullName || 'User Deleted'}</div>
                        <div className="text-xs text-stone-400 font-medium">{req.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(req.status)}</td>
                      <td className="px-6 py-5 text-stone-400 font-mono text-xs">{new Date(req.submittedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                          className="text-stone-400 hover:text-orange-600 font-bold text-xs bg-stone-50 hover:bg-white px-3 py-1.5 rounded-lg border border-stone-100 hover:border-orange-200 transition-all shadow-sm"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-100 shadow-2xl"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="text-2xl font-black flex items-center gap-3 font-serif text-stone-900">
                  <div className="bg-white p-2 rounded-xl border border-stone-100 shadow-sm"><ChefHat className="text-orange-500" /></div>
                  {selectedRequest.businessName}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-900 p-2 rounded-full hover:bg-stone-200 transition-colors"><XCircle size={24} /></button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-400 uppercase font-black tracking-widest">Cuisine</span>
                    <p className="text-xl font-bold text-stone-900 font-serif mt-1">{selectedRequest.cuisine}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-400 uppercase font-black tracking-widest">Location</span>
                    <p className="text-xl font-bold text-stone-900 font-serif mt-1">{selectedRequest.location}</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100">
                  <span className="text-xs text-stone-400 uppercase font-black tracking-widest">Famous For</span>
                  <p className="text-stone-600 font-medium mt-2 leading-relaxed italic">"{selectedRequest.famousFor}"</p>
                </div>

                {selectedRequest.document && (
                  <div className="flex items-center justify-between p-5 rounded-2xl border border-blue-100 bg-blue-50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm"><FileText className="text-blue-500" /></div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">Verification Document</p>
                        <p className="text-xs text-blue-500 font-medium">{selectedRequest.document.fileName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadDocument(selectedRequest.document)}
                      className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl text-blue-500 transition-all shadow-sm"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-4 pt-6 mt-6 border-t border-stone-100">
                    <button
                      onClick={() => updateRequestStatus(selectedRequest._id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest._id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;