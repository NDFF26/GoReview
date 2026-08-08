import React, { useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Star,
  AlertTriangle
} from 'lucide-react';
import { BusinessUser } from '../../types/user';
import { incrementUserStat } from '../../utils/storage';

interface ContactPageProps {
  user: BusinessUser;
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ user, onNavigate }) => {
  const isExpired = user.subscriptionExpiryDate ? new Date() > new Date(user.subscriptionExpiryDate) : false;
  const isInactive = user.isDisabled || isExpired;

  useEffect(() => {
    if (!isInactive) {
      incrementUserStat(user.username, 'pageViews');
      incrementUserStat(user.username, 'contactClicks');
    }
  }, [user.username, isInactive]);

  if (isInactive) {
    const whatsappRenewUrl = `https://wa.me/918320344204?text=${encodeURIComponent(
      `Hi GoReview Team, I want to renew the subscription plan for my business: ${user.businessName} (Username: ${user.username}). Please help me renew.`
    )}`;

    return (
      <div className="min-h-screen bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full mb-2">
              {isExpired ? 'Subscription Expired' : 'Account Temporarily Inactive'}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {user.businessName}
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {isExpired
              ? `The GoReview subscription plan for ${user.businessName} expired on ${user.subscriptionExpiryDate || 'recently'}. Please renew your plan to reactivate live contact details.`
              : `This business contact profile is currently disabled by administration. Contact GoReview support to restore access.`}
          </p>

          {/* Connect WhatsApp to Renew Plan Button */}
          <div className="pt-2">
            <a
              href={whatsappRenewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5 fill-white text-white" />
              <span>Connect GoReview WhatsApp (Renew Plan)</span>
            </a>
          </div>

          <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
            Powered by <span className="font-semibold text-slate-600">GoReview.in</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 p-4 sm:p-6 my-auto">
        {/* Dark Header Card matching Image 2 */}
        <div className="bg-[#0B132B] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
          <div className="flex items-center space-x-4">
            {/* White Logo Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img
                src={user.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
                alt={user.businessName}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Business Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {user.businessName}
              </h1>
              <p className="text-xs text-slate-300 font-normal mt-0.5 leading-snug">
                {user.tagline}
              </p>
            </div>
          </div>

          {/* Full Address */}
          {user.address && (
            <div className="mt-4 text-xs text-slate-300 font-normal leading-relaxed border-t border-slate-800/80 pt-3">
              {user.address}
            </div>
          )}
        </div>

        {/* Subtitle Greeting Text */}
        <p className="text-xs sm:text-sm text-slate-600 text-center my-6 px-2 leading-relaxed">
          Thanks for visiting {user.businessName.split('-')[0].trim()}! Connect with us, share your experience, and stay updated with every option below.
        </p>

        {/* Grid of Branded Contact & Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {/* Call Card */}
          <a
            href={`tel:${user.phone}`}
            className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-900">Call</span>
          </a>

          {/* WhatsApp Card */}
          <a
            href={`https://wa.me/${user.whatsapp}?text=Hi%20${encodeURIComponent(user.businessName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-emerald-500 fill-emerald-500" />
            </div>
            <span className="text-xs font-bold text-slate-900">WhatsApp</span>
          </a>

          {/* Email Card */}
          <a
            href={`mailto:${user.email}`}
            className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-xs font-bold text-slate-900">Email</span>
          </a>

          {/* Website Card */}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-900">Website</span>
            </a>
          )}

          {/* Instagram Card */}
          {user.instagram && (
            <a
              href={user.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-xs font-bold text-slate-900">Instagram</span>
            </a>
          )}

          {/* LinkedIn Card */}
          {user.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Linkedin className="w-6 h-6 text-sky-700" />
              </div>
              <span className="text-xs font-bold text-slate-900">LinkedIn</span>
            </a>
          )}

          {/* YouTube Card */}
          {user.youtube && (
            <a
              href={user.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Youtube className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs font-bold text-slate-900">YouTube</span>
            </a>
          )}

          {/* Google Review Card */}
          <button
            onClick={() => onNavigate(`/user/${user.username}`)}
            className="bg-slate-50/80 hover:bg-slate-100/90 text-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex flex-col items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-900">Review</span>
          </button>
        </div>

        {/* Footer Credit matching Image 1 & 2 */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Powered by <span className="font-semibold text-slate-600">GoReview.in</span>
          </p>
        </div>
      </div>
    </div>
  );
};
