import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Star,
  Eye,
  Check,
  Calendar,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Clock,
  Upload,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { BusinessUser, ReviewOption } from '../../types/user';
import { getStoredReviewDataMap, saveReviewDataMap } from '../../utils/reviewData';

interface UserEditorModalProps {
  userToEdit: BusinessUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: BusinessUser) => void;
}

export const UserEditorModal: React.FC<UserEditorModalProps> = ({
  userToEdit,
  isOpen,
  onClose,
  onSave
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<BusinessUser>>({
    username: '',
    businessName: '',
    tagline: '',
    logoUrl: '',
    coverUrl: '',
    googleReviewUrl: '',
    ratingScore: 4.9,
    reviewCount: 50,
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    mapUrl: '',
    description: '',
    operatingHours: 'Mon - Sat: 09:00 AM - 08:00 PM',
    instagram: '',
    facebook: '',
    website: '',
    youtube: '',
    twitter: '',
    linkedin: '',
    topics: [],
    languages: ['English', 'Gujarati', 'Hindi'],
    reviewOptions: [
      { id: '1', text: 'Outstanding service and friendly staff! Highly recommended.', category: 'Service' },
      { id: '2', text: 'Very professional, fast response, and top quality results.', category: 'Quality' },
      { id: '3', text: 'Great experience from start to finish. Will definitely come back!', category: 'Overall' }
    ],
    enablePrivateFeedback: true,
    privateFeedbackEmail: '',
    privateFeedbackPhone: '',
    isDisabled: false,
    subscriptionStartDate: todayStr,
    subscriptionExpiryDate: nextYearStr
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'subscription' | 'contact' | 'reviews' | 'preview'>('basic');
  const [previewMode, setPreviewMode] = useState<'review' | 'contact'>('review');

  const [newTopicInput, setNewTopicInput] = useState('');
  const [newLanguageInput, setNewLanguageInput] = useState('');

  const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileErrorMsg(null);
    if (file.size > 8 * 1024 * 1024) {
      setFileErrorMsg('Logo file exceeds 8MB limit. Please choose a smaller PNG or JPG image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileErrorMsg(null);
    if (file.size > 8 * 1024 * 1024) {
      setFileErrorMsg('Cover file exceeds 8MB limit. Please choose a smaller PNG or JPG image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, coverUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTopic = (topicToAdd?: string) => {
    const val = (topicToAdd || newTopicInput).trim();
    if (!val) return;
    const current = formData.topics || [];
    if (!current.includes(val)) {
      setFormData((prev) => ({ ...prev, topics: [...(prev.topics || []), val] }));
    }
    setNewTopicInput('');
  };

  const handleRemoveTopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      topics: (prev.topics || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddLanguage = (langToAdd?: string) => {
    const val = (langToAdd || newLanguageInput).trim();
    if (!val) return;
    const current = formData.languages || [];
    if (!current.includes(val)) {
      setFormData((prev) => ({ ...prev, languages: [...(prev.languages || []), val] }));
    }
    setNewLanguageInput('');
  };

  const handleRemoveLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        ...userToEdit,
        topics: userToEdit.topics || [],
        languages: userToEdit.languages && userToEdit.languages.length > 0
          ? userToEdit.languages
          : ['English', 'Gujarati', 'Hindi'],
        subscriptionStartDate: userToEdit.subscriptionStartDate || todayStr,
        subscriptionExpiryDate: userToEdit.subscriptionExpiryDate || nextYearStr,
        isDisabled: !!userToEdit.isDisabled
      });
    } else {
      setFormData({
        id: `user_${Date.now()}`,
        username: '',
        businessName: '',
        tagline: '',
        logoUrl: '',
        coverUrl: '',
        googleReviewUrl: '',
        ratingScore: 4.9,
        reviewCount: 50,
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        mapUrl: '',
        description: '',
        operatingHours: 'Mon - Sat: 09:00 AM - 08:00 PM',
        instagram: '',
        facebook: '',
        website: '',
        youtube: '',
        twitter: '',
        linkedin: '',
        topics: [],
        languages: ['English', 'Gujarati', 'Hindi'],
        reviewOptions: [
          { id: '1', text: 'Outstanding service and friendly staff! Highly recommended.', category: 'General' },
          { id: '2', text: 'Very professional, fast response, and top quality results.', category: 'Quality' },
          { id: '3', text: 'Great experience from start to finish. Will definitely come back!', category: 'Overall' }
        ],
        enablePrivateFeedback: true,
        privateFeedbackEmail: '',
        privateFeedbackPhone: '',
        isDisabled: false,
        subscriptionStartDate: todayStr,
        subscriptionExpiryDate: nextYearStr,
        pageViews: 0,
        reviewClicks: 0,
        contactClicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleUsernameChange = (val: string) => {
    const slug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    setFormData((prev) => ({ ...prev, username: slug }));
  };

  const handleAddReviewOption = () => {
    const newOpt: ReviewOption = {
      id: Date.now().toString(),
      text: '',
      category: 'General'
    };
    setFormData((prev) => ({
      ...prev,
      reviewOptions: [...(prev.reviewOptions || []), newOpt]
    }));
  };

  const handleUpdateReviewOption = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      reviewOptions: (prev.reviewOptions || []).map((opt) => (opt.id === id ? { ...opt, text } : opt))
    }));
  };

  const handleRemoveReviewOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      reviewOptions: (prev.reviewOptions || []).filter((opt) => opt.id !== id)
    }));
  };

  const setPresetSubscriptionDays = (days: number) => {
    const start = formData.subscriptionStartDate ? new Date(formData.subscriptionStartDate) : new Date();
    const exp = new Date(start);
    exp.setDate(exp.getDate() + days);

    setFormData((prev) => ({
      ...prev,
      subscriptionStartDate: start.toISOString().split('T')[0],
      subscriptionExpiryDate: exp.toISOString().split('T')[0]
    }));
  };

  const setPresetSubscription = (months: number) => {
    const start = formData.subscriptionStartDate ? new Date(formData.subscriptionStartDate) : new Date();
    const exp = new Date(start);
    exp.setMonth(exp.getMonth() + months);

    setFormData((prev) => ({
      ...prev,
      subscriptionStartDate: start.toISOString().split('T')[0],
      subscriptionExpiryDate: exp.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFileErrorMsg(null);
    if (!formData.username || !formData.businessName) {
      setFileErrorMsg('Please fill in both Username / Slug and Business Name');
      return;
    }

    const finalUser: BusinessUser = {
      id: formData.id || `user_${Date.now()}`,
      username: formData.username.toLowerCase().trim(),
      businessName: formData.businessName.trim(),
      tagline: formData.tagline || '',
      logoUrl: formData.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      coverUrl: formData.coverUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
      googleReviewUrl: formData.googleReviewUrl || `https://search.google.com/local/writereview?q=${encodeURIComponent(formData.businessName)}`,
      googlePlaceId: formData.googlePlaceId || '',
      ratingScore: Number(formData.ratingScore) || 4.9,
      reviewCount: Number(formData.reviewCount) || 25,
      phone: formData.phone || '',
      whatsapp: formData.whatsapp || formData.phone || '',
      email: formData.email || '',
      address: formData.address || '',
      mapUrl: formData.mapUrl || '',
      description: formData.description || '',
      operatingHours: formData.operatingHours || 'Mon - Sat: 09:00 AM - 08:00 PM',
      instagram: formData.instagram || '',
      facebook: formData.facebook || '',
      website: formData.website || '',
      youtube: formData.youtube || '',
      twitter: formData.twitter || '',
      linkedin: formData.linkedin || '',
      topics: formData.topics && formData.topics.length > 0 ? formData.topics : ['General Service'],
      languages: formData.languages && formData.languages.length > 0 ? formData.languages : ['English', 'Gujarati', 'Hindi'],
      reviewOptions: (formData.reviewOptions || []).filter((o) => o.text.trim().length > 0),
      enablePrivateFeedback: formData.enablePrivateFeedback ?? true,
      privateFeedbackEmail: formData.privateFeedbackEmail || formData.email || '',
      privateFeedbackPhone: formData.privateFeedbackPhone || formData.phone || '',
      isDisabled: !!formData.isDisabled,
      subscriptionStartDate: formData.subscriptionStartDate || todayStr,
      subscriptionExpiryDate: formData.subscriptionExpiryDate || nextYearStr,
      pageViews: formData.pageViews || 0,
      reviewClicks: formData.reviewClicks || 0,
      contactClicks: formData.contactClicks || 0,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Sync review data map storage for topics & languages
    try {
      const reviewMap = getStoredReviewDataMap();
      reviewMap[finalUser.username] = {
        businessName: finalUser.businessName,
        topics: finalUser.topics,
        languages: finalUser.languages,
        reviews: reviewMap[finalUser.username]?.reviews || {}
      };
      saveReviewDataMap(reviewMap);
    } catch (e) {
      console.error('Failed to sync review data map on user save:', e);
    }

    onSave(finalUser);
  };

  const isExpired = formData.subscriptionExpiryDate ? new Date() > new Date(formData.subscriptionExpiryDate) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
              <span>{userToEdit ? 'Edit Client Business' : 'Add New Client Business'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Creates dynamic Google Review page (<span className="font-mono text-blue-400">/user/{formData.username || 'username'}</span>) & Contact page
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3 overflow-x-auto space-x-2 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-3 px-4 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Business Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`pb-3 px-4 rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'subscription'
                ? 'border-blue-600 text-blue-600 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>2. Subscription & Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`pb-3 px-4 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Contact & Socials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Topics & Reviews
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-4 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-emerald-600 text-emerald-600 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Mobile Preview</span>
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {fileErrorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{fileErrorMsg}</span>
            </div>
          )}
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username / URL Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 text-xs font-mono select-none">/user/</span>
                    <input
                      type="text"
                      required
                      placeholder="velocityi2"
                      value={formData.username || ''}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="w-full pl-16 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Live links: <span className="font-mono text-blue-600 font-semibold">/user/{formData.username || 'slug'}</span> and <span className="font-mono text-emerald-600 font-semibold">/user/{formData.username || 'slug'}/contact</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Velocity i2 Solutions"
                    value={formData.businessName || ''}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Tagline / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. PCB Design, Hardware & Product Development"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  About Business Description (Used for generating tailored reviews)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief details about products, services, specialty, or business description..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Prominent Google Review URL Input in Tab 1 */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Google Review Link (Direct Write Review URL)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Required for Redirect
                  </span>
                </div>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://search.google.com/local/writereview?placeid=ChIJ... or https://g.page/r/..."
                  value={formData.googleReviewUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all font-mono shadow-xs"
                />
                <p className="text-[11px] text-amber-800 leading-snug">
                  📌 This is the link customers will be redirected to after selecting their topic & review in 1-click. You can copy this link from your Google Business Profile &gt; "Ask for reviews".
                </p>
              </div>

              {/* Logo & Cover Image Section with PNG/JPG File Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Image Upload */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Business Logo (PNG / JPG)
                    </label>
                    <span className="text-[11px] text-blue-600 font-semibold">File Upload or URL</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo File</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Supports PNG, JPG, WEBP, SVG</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Or paste direct image URL:</label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Cover Banner Upload */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Cover Banner (PNG / JPG)
                    </label>
                    <span className="text-[11px] text-blue-600 font-semibold">File Upload or URL</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-14 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group">
                      {formData.coverUrl ? (
                        <img
                          src={formData.coverUrl}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Cover File</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          onChange={handleCoverFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Supports PNG, JPG, WEBP, SVG</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Or paste direct cover URL:</label>
                    <input
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={formData.coverUrl || ''}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION & ACCOUNT STATUS */}
          {activeTab === 'subscription' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Subscription & Account Plan</h4>
                  <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                    Set subscription start date, duration, and expiry date for this business client. You can also temporarily disable the user account.
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  {formData.isDisabled ? (
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                      <Ban className="w-5 h-5" />
                    </div>
                  ) : isExpired ? (
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Status</span>
                    <p className="text-sm font-bold text-slate-900">
                      {formData.isDisabled ? (
                        <span className="text-red-600">Disabled (Deactivated)</span>
                      ) : isExpired ? (
                        <span className="text-amber-600">Subscription Expired</span>
                      ) : (
                        <span className="text-emerald-600">Active & Running</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Disable User Toggle Button */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isDisabled: !formData.isDisabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    formData.isDisabled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                  }`}
                >
                  {formData.isDisabled ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enable Account</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>Disable User</span>
                    </>
                  )}
                </button>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subscription Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.subscriptionStartDate || todayStr}
                    onChange={(e) => setFormData({ ...formData, subscriptionStartDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subscription Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.subscriptionExpiryDate || nextYearStr}
                    onChange={(e) => setFormData({ ...formData, subscriptionExpiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Preset Duration Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quick Extend Plan Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetSubscriptionDays(3)}
                    className="px-3.5 py-2 bg-blue-500 text-white hover:bg-blue-600 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1"
                  >
                    <span>3 Days Trial</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetSubscription(1)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    +1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetSubscription(6)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    +6 Months
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetSubscription(12)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    +1 Year (12 Months)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetSubscription(120)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    Unlimited (10 Years)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & SOCIAL LINKS */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Number (with country code)
                  </label>
                  <input
                    type="text"
                    placeholder="919876543210"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="contact@business.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    placeholder="Mon - Sat: 09:00 AM - 08:00 PM"
                    value={formData.operatingHours || ''}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  placeholder="Shop / Suite / Office No, Street Name, Landmark, City"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Google Maps Directions Link
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.mapUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Social Handles */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Social Media Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                  <input
                    type="url"
                    placeholder="Facebook URL"
                    value={formData.facebook || ''}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                  <input
                    type="url"
                    placeholder="YouTube URL"
                    value={formData.youtube || ''}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOPICS & REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Topic Tag Manager */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Business Review Topics
                    </label>
                    <span className="text-[11px] text-blue-600 font-semibold font-mono">
                      {formData.topics?.length || 0} Added
                    </span>
                  </div>

                  {/* Input and Add Button */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. PCB Design, Customer Support..."
                      value={newTopicInput}
                      onChange={(e) => setNewTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTopic();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTopic()}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Topic Badge List */}
                  <div className="flex flex-wrap gap-1.5 min-h-[42px] max-h-36 overflow-y-auto bg-white p-2.5 rounded-xl border border-slate-200">
                    {(formData.topics || []).map((t, idx) => (
                      <span
                        key={`${t}_${idx}`}
                        className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(idx)}
                          className="hover:text-red-600 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!formData.topics || formData.topics.length === 0) && (
                      <span className="text-xs text-slate-400 italic">No topics added. Type above to add topics.</span>
                    )}
                  </div>

                  {/* Preset topic shortcuts */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Quick Add Common Topics:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {['PCB Design', 'Hardware Design', 'Firmware', 'Product Development', 'Insurance Advisory', 'Documentation', 'Financial Consulting', 'Customer Service', 'Quality Work', 'Billing'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAddTopic(preset)}
                          className="px-2 py-0.5 bg-slate-200/70 hover:bg-blue-100 text-slate-700 hover:text-blue-800 text-[10px] font-medium rounded-md transition-all"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Language Tag Manager */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Review Languages
                    </label>
                    <span className="text-[11px] text-blue-600 font-semibold font-mono">
                      {formData.languages?.length || 0} Added
                    </span>
                  </div>

                  {/* Input and Add Button */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. English, Gujlish, Hinglish..."
                      value={newLanguageInput}
                      onChange={(e) => setNewLanguageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLanguage();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddLanguage()}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Language Badge List */}
                  <div className="flex flex-wrap gap-1.5 min-h-[42px] max-h-36 overflow-y-auto bg-white p-2.5 rounded-xl border border-slate-200">
                    {(formData.languages || []).map((lang, idx) => (
                      <span
                        key={`${lang}_${idx}`}
                        className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        <span>{lang}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(idx)}
                          className="hover:text-red-600 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!formData.languages || formData.languages.length === 0) && (
                      <span className="text-xs text-slate-400 italic">No languages added. Type above to add languages.</span>
                    )}
                  </div>

                  {/* Preset language shortcuts */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Quick Add Popular Options:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {['English', 'Gujarati', 'Gujlish', 'Hindi', 'Hinglish', 'Marathi', 'Tamil', 'Telugu'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAddLanguage(preset)}
                          className="px-2 py-0.5 bg-slate-200/70 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[10px] font-medium rounded-md transition-all"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Google Review Link in Tab 4 */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Direct Google Place Write Review Link</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Required Destination
                  </span>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={formData.googleReviewUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all font-mono shadow-xs"
                />
                <p className="text-[11px] text-amber-800">
                  When customers tap "Copy &amp; Post on Google", they are redirected straight to this URL with their copied review!
                </p>
              </div>

              {/* Pre-written review options */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      User Custom Review Line Templates (3-15 Words)
                    </h4>
                    <p className="text-xs text-slate-500">Add user-specific short 3 to 15 words review templates</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReviewOption}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Review Line</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {(formData.reviewOptions || []).map((opt, idx) => (
                    <div key={opt.id} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleUpdateReviewOption(opt.id, e.target.value)}
                        placeholder="e.g. Flawless track clearance and component routing!"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveReviewOption(opt.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Rating Feedback Shield */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-amber-900">Negative Rating Protection Shield</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enablePrivateFeedback ?? true}
                      onChange={(e) => setFormData({ ...formData, enablePrivateFeedback: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <p className="text-xs text-amber-800">
                  When enabled, ratings of 1 to 3 stars will NOT go to Google Reviews. Instead, customers see a private feedback form so issues are sent directly to your phone/email!
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between bg-slate-100 p-2 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 px-3">Simulate Screen:</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('review')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      previewMode === 'review' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700'
                    }`}
                  >
                    Google Review Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('contact')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      previewMode === 'contact' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-slate-700'
                    }`}
                  >
                    Digital Contact Page
                  </button>
                </div>
              </div>

              {/* Mobile Phone Mockup View */}
              <div className="max-w-xs mx-auto bg-slate-900 p-3 rounded-[36px] shadow-2xl border-4 border-slate-800">
                <div className="bg-white rounded-[28px] overflow-hidden min-h-[480px] max-h-[500px] overflow-y-auto text-slate-900 text-xs">
                  <div className="bg-slate-900 text-white p-3 text-center relative">
                    <img
                      src={formData.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
                      alt="Logo"
                      className="w-12 h-12 rounded-full mx-auto border-2 border-white object-cover shadow"
                    />
                    <h3 className="font-bold text-sm mt-1">{formData.businessName || 'Business Name'}</h3>
                    <p className="text-[10px] text-slate-300 truncate">{formData.tagline || 'Tagline / Category'}</p>
                  </div>

                  {previewMode === 'review' ? (
                    <div className="p-4 text-center space-y-3">
                      <div className="flex flex-wrap gap-1 justify-center my-2">
                        {(formData.topics || []).slice(0, 3).map((t) => (
                          <span key={t} className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-left space-y-1">
                        <span className="text-[10px] font-bold text-blue-700 uppercase">3-15 Word Review Line:</span>
                        <p className="text-[11px] text-slate-700">
                          {formData.reviewOptions?.[0]?.text || 'Outstanding service and friendly staff!'}
                        </p>
                      </div>
                      <div className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-center">
                        Copy & Post Review on Google
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-center font-bold">
                        <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl">Call Now</div>
                        <div className="bg-green-50 text-green-700 p-2 rounded-xl">WhatsApp</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                        <div className="font-semibold text-slate-900">Phone: {formData.phone || '+91 9876543210'}</div>
                        <div className="text-slate-600">Email: {formData.email || 'info@business.com'}</div>
                        <div className="text-slate-600">Address: {formData.address || 'Commercial Address'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              /user/{formData.username || 'username'}
            </span>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Client Data</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
