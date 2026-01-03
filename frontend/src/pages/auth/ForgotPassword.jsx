import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, { email });
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-otp`, { email, otp });
      setStep(3);
    } catch (err) {
      alert('Invalid OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, { email, otp, newPassword });
      alert('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center pt-32 p-4 overflow-hidden">
      <div className="gradient-bg"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-strong rounded-3xl p-8 md:p-10 border border-white/10">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-400 text-sm">
              {step === 1 ? 'Enter your email to receive a code' :
                step === 2 ? 'Enter the verification code' : 'Create your new password'}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-12 p-3 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <button type="submit" className="btn-royal w-full p-3 rounded-xl">
                Send OTP
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="glass-input w-full pl-12 p-3 rounded-xl focus:outline-none tracking-[0.5em] text-center font-bold"
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn-royal w-full p-3 rounded-xl">
                Verify Code
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input w-full pl-12 p-3 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <button type="submit" className="btn-royal w-full p-3 rounded-xl">
                Reset Password
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;