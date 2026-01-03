import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Key, ArrowLeft, Loader, Zap, CircuitBoard } from 'lucide-react'
import { api } from '../../services/api.js'

const Login = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const response = await api.post('/auth/login', { email: formData.email, password: formData.password });
      if (response.data.requireOtp) setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const response = await api.post('/auth/verify-login', { email: formData.email, otp: formData.otp });
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Code');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center px-8 pb-8 pt-36 bg-[#f8f5f0] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast"><CircuitBoard size={120} /></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-stone-100">

          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-orange-50 mb-4 border border-orange-100 shadow-sm">
              <Zap className="size-6 text-brand" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {step === 1 ? 'Welcome Back' : 'Security Check'}
            </h2>
            <p className="text-gray-500 text-sm">
              {step === 1 ? 'Enter your credentials to continue' : `We sent a code to ${formData.email}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2 animate-in slide-in-from-top-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 pl-12 rounded-xl h-12 px-4 focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-50 pl-12 rounded-xl h-12 px-4 focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-brand hover:text-orange-700 transition-colors font-bold">
                  Forgot Password?
                </Link>
              </div>

              <button disabled={loading} className="btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand/20 mt-2">
                {loading ? <Loader className="animate-spin text-white" /> : 'Access Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">One-Time Password</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="123456"
                    className="w-full bg-gray-50 pl-12 rounded-xl h-12 px-4 focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all tracking-[0.5em] text-lg font-bold text-center text-gray-900"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button disabled={loading} className="btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
                {loading ? <Loader className="animate-spin text-white" /> : 'Verify & Enter'}
              </button>

              <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-gray-900 flex items-center justify-center gap-2 transition-colors font-medium">
                <ArrowLeft size={16} /> Back to Login
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">
              New to FoodieAI?{' '}
              <Link to="/register" className="text-brand font-bold hover:text-orange-700 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login