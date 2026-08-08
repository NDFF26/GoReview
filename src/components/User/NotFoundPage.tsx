import React from 'react';
import { AlertCircle } from 'lucide-react';

interface NotFoundPageProps {
  attemptedUsername: string;
  onNavigate: (path: string) => void;
  onAddNewUserWithSlug: (slug: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  attemptedUsername
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">Business Profile Unavailable</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          The requested business profile <span className="font-mono text-slate-700 font-bold">/user/{attemptedUsername}</span> is not found or is currently inactive. Please verify the URL or contact the business directly.
        </p>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Powered by GoReview Client Portal
          </p>
        </div>
      </div>
    </div>
  );
};

