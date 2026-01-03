import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Key, Check, Users, ChefHat, Sparkles, Loader, ArrowLeft, ArrowRight, CircuitBoard } from 'lucide-react'
import { api } from '../../services/api'

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    otp: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await api.post('/auth/register', {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      setCurrentStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const response = await api.post('/auth/verify-signup', {
        email: formData.email,
        otp: formData.otp
      });

      localStorage.setItem('userData', JSON.stringify(response.data.user));

      if (formData.role === 'restaurant') {
        navigate('/restaurant-signup');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Invalid OTP code');
    } finally { setLoading(false); }
  };

  const nextStep = () => setCurrentStep(p => p + 1);
  const prevStep = () => setCurrentStep(p => p - 1);
  const handleRoleSelect = (role) => setFormData(p => ({ ...p, role }));

  return (
    <div className="min-h-screen relative flex flex-col items-center px-8 pb-8 pt-36 bg-[#f8f5f0] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium">🥬</div>
      <div className="absolute top-40 right-[20%] opacity-10 text-stone-900 pointer-events-none animate-float-fast"><CircuitBoard size={120} /></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-stone-100">

          {/* Progress Bar */}
          <div className="flex justify-between mb-10 px-2 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step <= currentStep
                  ? 'bg-brand text-white shadow-lg shadow-brand/20 scale-110'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
              >
                {step < currentStep ? <Check size={14} /> : step}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {currentStep === 4 ? 'Verify Identity' : 'Create Account'}
            </h2>
            <p className="text-gray-500 text-sm">
              Step {currentStep} of 4 • {currentStep === 1 ? 'Basic Info' : currentStep === 2 ? 'Security' : currentStep === 3 ? 'Account Type' : 'Verification'}
            </p>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 text-center font-medium">{error}</div>}

          {/* Form Content */}
          {currentStep < 4 ? (
            <form onSubmit={(e) => {
              if (currentStep === 3) handleRegister(e);
              else { e.preventDefault(); nextStep(); }
            }} className="space-y-6">

              {/* Step 1: Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                      <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900 placeholder:text-gray-400" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
                      <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900 placeholder:text-gray-400" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 pl-12 p-3 rounded-xl focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900 placeholder:text-gray-400" placeholder="name@example.com" required />
                    </div>
                  </div>
                  <button type="button" onClick={nextStep} className="btn-primary w-full p-3 rounded-xl mt-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-brand/20">
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 2: Password */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                      <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-50 pl-12 p-3 rounded-xl focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900 placeholder:text-gray-400" placeholder="••••••••" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-gray-50 pl-12 p-3 rounded-xl focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900 placeholder:text-gray-400" placeholder="••••••••" required />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={prevStep} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-3 rounded-xl font-bold transition-colors">Back</button>
                    <button type="button" onClick={nextStep} className="flex-1 btn-primary p-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-brand/20">Next <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}

              {/* Step 3: Role */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => handleRoleSelect('customer')}
                      className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-md ${formData.role === 'customer'
                        ? 'bg-orange-50 border-brand ring-1 ring-brand'
                        : 'bg-white border-gray-200 hover:border-brand/50'
                        }`}
                    >
                      <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Users className="text-brand" size={24} />
                      </div>
                      <h3 className="text-gray-900 font-bold text-center mb-1">Foodie</h3>
                      <p className="text-gray-500 text-xs text-center font-medium">Discover & Eat</p>
                    </div>

                    <div
                      onClick={() => handleRoleSelect('restaurant')}
                      className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-md ${formData.role === 'restaurant'
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-white border-gray-200 hover:border-indigo-500/50'
                        }`}
                    >
                      <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <ChefHat className="text-indigo-600" size={24} />
                      </div>
                      <h3 className="text-gray-900 font-bold text-center mb-1">Restaurant</h3>
                      <p className="text-gray-500 text-xs text-center font-medium">Manage Business</p>
                    </div>
                  </div>

                  {formData.role && (
                    <button type="submit" disabled={loading} className="btn-primary w-full p-3 rounded-xl mt-4 shadow-lg shadow-brand/20 flex items-center justify-center gap-2 font-bold">
                      {loading ? <Loader className="animate-spin text-white" /> : 'Create Account'}
                    </button>
                  )}
                  <button type="button" onClick={prevStep} className="w-full text-gray-500 text-sm hover:text-gray-900 transition-colors font-medium">Back</button>
                </div>
              )}
            </form>
          ) : (
            /* Step 4: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in zoom-in-95 fade-in duration-300">
              <div className="bg-gray-50 p-4 rounded-xl text-center mb-6 border border-gray-100">
                <p className="text-gray-500 text-sm">We sent a 6-digit code to</p>
                <p className="text-brand font-bold">{formData.email}</p>
              </div>

              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                <input
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full bg-gray-50 pl-12 p-3 rounded-xl tracking-[0.5em] text-center font-bold text-lg focus:outline-none border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand transition-all text-gray-900"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full p-3 rounded-xl shadow-lg shadow-brand/20 flex items-center justify-center gap-2 font-bold">
                {loading ? <Loader className="animate-spin text-white" /> : 'Verify & Complete'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-brand font-bold hover:text-orange-700 transition-colors">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Signup