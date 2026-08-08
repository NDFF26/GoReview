import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Star,
  Contact,
  QrCode,
  Copy,
  Edit,
  Trash2,
  Check,
  Download,
  Sparkles,
  Globe,
  Eye,
  Ban,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { BusinessUser } from '../../types/user';
import { getAppBaseUrl, getUserFullUrls } from '../../utils/urlUtils';

interface AdminDashboardProps {
  users: BusinessUser[];
  onAddNewUser: () => void;
  onEditUser: (user: BusinessUser) => void;
  onDeleteUser: (userId: string) => void;
  onToggleDisableUser?: (userId: string) => void;
  onOpenQRModal: (user: BusinessUser) => void;
  onOpenImportExport: () => void;
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  onAddNewUser,
  onEditUser,
  onDeleteUser,
  onToggleDisableUser,
  onOpenQRModal,
  onOpenImportExport,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<BusinessUser | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.businessName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.tagline.toLowerCase().includes(term) ||
      u.phone.includes(term)
    );
  });

  const activeCount = users.filter((u) => !u.isDisabled && (!u.subscriptionExpiryDate || new Date(u.subscriptionExpiryDate) >= new Date())).length;
  const disabledCount = users.filter((u) => u.isDisabled).length;
  const expiredCount = users.filter((u) => !u.isDisabled && u.subscriptionExpiryDate && new Date(u.subscriptionExpiryDate) < new Date()).length;

  const totalPageViews = users.reduce((acc, u) => acc + (u.pageViews || 0), 0);
  const totalReviewClicks = users.reduce((acc, u) => acc + (u.reviewClicks || 0), 0);
  const totalContactClicks = users.reduce((acc, u) => acc + (u.contactClicks || 0), 0);

  const handleCopy = (text: string, copyKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(copyKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const baseUrl = getAppBaseUrl();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-blue-500/30 mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>GoReview Subscription & Client Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Google Review & Contact Solution
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Manage client review profiles, subscription start/expiry dates, custom topics, and account active/disabled status instantly.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenImportExport}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700/80 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Backup / Import</span>
            </button>

            <button
              onClick={onAddNewUser}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-900/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Clients ({users.length})</p>
              <div className="flex items-center space-x-2 text-xs font-bold mt-0.5">
                <span className="text-emerald-600">{activeCount} Active</span>
                {disabledCount > 0 && <span className="text-red-500">• {disabledCount} Disabled</span>}
                {expiredCount > 0 && <span className="text-amber-500">• {expiredCount} Expired</span>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Review Clicks</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalReviewClicks}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Contact className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Clicks</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalContactClicks}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Visits</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalPageViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by business name, username, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredUsers.length}</span> of {users.length} clients
          </p>
        </div>

        {/* Client Cards Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm my-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No client businesses found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first client business profile.'}
            </p>
            <button
              onClick={onAddNewUser}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client Business</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUsers.map((u) => {
              const userUrls = getUserFullUrls(u.username);
              const reviewPath = `/user/${u.username}`;
              const contactPath = `/user/${u.username}/contact`;
              const fullReviewUrl = userUrls.reviewUrl;
              const fullContactUrl = userUrls.contactUrl;

              const isExpired = u.subscriptionExpiryDate ? new Date() > new Date(u.subscriptionExpiryDate) : false;
              const isDisabled = !!u.isDisabled;

              return (
                <div
                  key={u.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                    isDisabled
                      ? 'border-red-200 bg-red-50/20 opacity-90'
                      : isExpired
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200/90 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Card Header & Brand */}
                  <div className="p-5 sm:p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={u.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
                          alt={u.businessName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                              {u.businessName}
                            </h3>
                            <span className="bg-slate-100 text-slate-700 font-mono text-[11px] px-2 py-0.5 rounded-md font-semibold">
                              /{u.username}
                            </span>

                            {/* Status Badge */}
                            {isDisabled ? (
                              <span className="bg-red-100 text-red-700 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 border border-red-200">
                                <Ban className="w-3 h-3" />
                                <span>Disabled</span>
                              </span>
                            ) : isExpired ? (
                              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Expired</span>
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{u.tagline || u.address}</p>

                          {/* Subscription dates row */}
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1 font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              Sub: <strong className="text-slate-700">{u.subscriptionStartDate || 'N/A'}</strong> to{' '}
                              <strong className={isExpired ? 'text-amber-600' : 'text-slate-700'}>
                                {u.subscriptionExpiryDate || 'N/A'}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Menu Buttons */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Toggle Disable Button */}
                        <button
                          onClick={() => onToggleDisableUser?.(u.id)}
                          title={isDisabled ? 'Enable User Account' : 'Disable User Account'}
                          className={`p-2 rounded-xl transition-colors ${
                            isDisabled
                              ? 'text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {isDisabled ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => onOpenQRModal(u)}
                          title="Generate QR Codes"
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditUser(u)}
                          title="Edit Client"
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setUserToDelete(u)}
                          title="Delete Client"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Generated Live Links Section */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 space-y-3">
                    {/* Topics Pill List */}
                    {u.topics && u.topics.length > 0 && (
                      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase">Topics:</span>
                        {u.topics.map((t) => (
                          <span key={t} className="bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 whitespace-nowrap">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link 1: Review Page */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700">
                          <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                          <span>Google Review Live Link</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleCopy(fullReviewUrl, `rev_${u.id}`)}
                            className="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                          >
                            {copiedId === `rev_${u.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === `rev_${u.id}` ? 'Copied' : 'Copy Link'}</span>
                          </button>

                          <button
                            onClick={() => onNavigate(reviewPath)}
                            className="flex items-center space-x-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg transition-colors shadow-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-slate-600 truncate">{fullReviewUrl}</p>
                    </div>

                    {/* Link 2: Contact Page */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                          <Contact className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Digital Contact Us Live Link</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleCopy(fullContactUrl, `cnt_${u.id}`)}
                            className="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                          >
                            {copiedId === `cnt_${u.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === `cnt_${u.id}` ? 'Copied' : 'Copy Link'}</span>
                          </button>

                          <button
                            onClick={() => onNavigate(contactPath)}
                            className="flex items-center space-x-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors shadow-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-slate-600 truncate">{fullContactUrl}</p>
                    </div>
                  </div>

                  {/* Card Footer Bar */}
                  <div className="px-5 sm:px-6 py-3.5 bg-slate-100/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-3">
                      <span>Phone: <strong className="text-slate-800">{u.phone || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Rating: <strong className="text-slate-800">{u.ratingScore} ★</strong></span>
                    </div>

                    <button
                      onClick={() => onOpenQRModal(u)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Get QR Codes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative border border-slate-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Client Business?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong className="text-slate-900">{userToDelete.businessName}</strong> (<span className="font-mono text-blue-600">/{userToDelete.username}</span>)? All associated link data and topic configurations will be removed.
            </p>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-red-200 transition-all active:scale-95"
              >
                Yes, Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
