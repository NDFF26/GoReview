import React from 'react';
import { AlertTriangle, Plus, LayoutDashboard } from 'lucide-react';

interface NotFoundPageProps {
  attemptedUsername: string;
  onNavigate: (path: string) => void;
  onAddNewUserWithSlug: (slug: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  attemptedUsername,
  onNavigate,
  onAddNewUserWithSlug
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mx-auto mb-4 border border-amber-200">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Business Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          No active client is registered with username slug <span className="font-mono text-blue-600 font-bold">/user/{attemptedUsername}</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onAddNewUserWithSlug(attemptedUsername)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Client Business "/user/{attemptedUsername}"</span>
          </button>

          <button
            onClick={() => onNavigate('/admin')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Admin Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
