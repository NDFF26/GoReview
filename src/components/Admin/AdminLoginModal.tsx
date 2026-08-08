import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, ShieldAlert, Check } from 'lucide-react';
import { checkAdminPassword } from '../../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(password.trim())) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-xl flex items-center justify-center border border-slate-200 shrink-0">
            <img 
              src="./logo.png" 
              alt="GoReview Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-full mb-2">
              GoReview Security
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Admin Panel Access
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Please enter your admin password to continue
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter admin password..."
                autoFocus
                className={`w-full pl-10 pr-10 py-3 bg-slate-950 border ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500'
                } rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center space-x-1.5 mt-2 text-xs text-red-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Incorrect admin password. Please try again.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all active:scale-98 flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Admin Dashboard</span>
          </button>
        </form>
      </div>
    </div>
  );
};
