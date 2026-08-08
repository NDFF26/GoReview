import React, { useState } from 'react';
import { LayoutDashboard, Star, Contact, Globe, Plus, LogOut, Key } from 'lucide-react';
import { BusinessUser } from '../types/user';

interface NavbarProps {
  currentPath: string;
  users: BusinessUser[];
  onNavigate: (path: string) => void;
  onAddNewUser: () => void;
  onLogout?: () => void;
  onChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPath, 
  users, 
  onNavigate, 
  onAddNewUser,
  onLogout,
  onChangePassword
}) => {
  const [customPath, setCustomPath] = useState(currentPath);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = customPath.trim();
    if (!target.startsWith('/')) {
      target = '/' + target;
    }
    onNavigate(target);
  };

  const isAdminPath = currentPath === '/admin' || currentPath === '/';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer shrink-0" onClick={() => onNavigate('/admin')}>
            <div className="bg-white p-1.5 rounded-xl shadow-md flex items-center justify-center border border-slate-200 shrink-0">
              <img 
                src="./logo.png" 
                alt="GoReview Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                GoReview
              </span>
              <span className="text-[10px] sm:text-xs bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30 whitespace-nowrap">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Quick Route Selector & Live URL Simulator Bar (desktop only) */}
          <div className="hidden lg:flex items-center space-x-3 flex-1 max-w-md mx-4">
            <form onSubmit={handleUrlSubmit} className="relative w-full flex items-center">
              <span className="absolute left-3 text-slate-500 text-xs font-mono select-none">
                {window.location.host}
              </span>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="/user/velocityi2"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono pl-32 pr-14 py-1.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
              >
                Go
              </button>
            </form>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={() => onNavigate('/admin')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isAdminPath
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* Quick Link Dropdown for Users */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-2.5 sm:px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-colors border border-slate-700/50">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden xs:inline">Links</span>
              </button>

              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                  Active Client Pages ({users.length})
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {users.map((u) => (
                    <div key={u.id} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
                      <div className="text-xs font-semibold text-white truncate">{u.businessName}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => onNavigate(`/user/${u.username}`)}
                          className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-800/40"
                        >
                          <Star className="w-3 h-3 fill-blue-400" />
                          <span>Review</span>
                        </button>
                        <button
                          onClick={() => onNavigate(`/user/${u.username}/contact`)}
                          className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40"
                        >
                          <Contact className="w-3 h-3" />
                          <span>Contact</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onAddNewUser}
              className="flex items-center space-x-1 px-2.5 sm:px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-emerald-900/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span><span className="hidden sm:inline">Add </span>Client</span>
            </button>

            {onChangePassword && (
              <button
                onClick={onChangePassword}
                title="Change Admin Password"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors border border-slate-700/50"
              >
                <Key className="w-4 h-4" />
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout Admin"
                className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded-xl text-xs transition-colors border border-red-800/40"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

