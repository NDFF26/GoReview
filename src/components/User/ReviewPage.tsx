import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { BusinessUser } from '../../types/user';
import { incrementUserStat } from '../../utils/storage';
import {
  getBusinessTopicsAndLanguages,
  getRandomReviewForTopicAndLanguage,
  fetchAiReview
} from '../../utils/reviewData';

interface ReviewPageProps {
  user: BusinessUser;
  onNavigate: (path: string) => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ user, onNavigate }) => {
  // Use user object directly to load user-wise topics & languages
  const { topics, languages } = getBusinessTopicsAndLanguages(user);

  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0] || 'General Service');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(languages[0] || 'English');
  const [generatedReviewText, setGeneratedReviewText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Check subscription status or account active status
  const isExpired = user.subscriptionExpiryDate ? new Date() > new Date(user.subscriptionExpiryDate) : false;
  const isInactive = user.isDisabled || isExpired;

  useEffect(() => {
    if (!isInactive) {
      incrementUserStat(user.username, 'pageViews');
    }
  }, [user.username, isInactive]);

  // Keep topic selected valid if topics list changes
  useEffect(() => {
    if (topics.length > 0 && !topics.includes(selectedTopic)) {
      setSelectedTopic(topics[0]);
    }
  }, [topics]);

  // Keep language selected valid if languages list changes
  useEffect(() => {
    if (languages.length > 0 && !languages.includes(selectedLanguage)) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages]);

  // Update review text whenever topic or language changes
  useEffect(() => {
    if (!isInactive) {
      loadReviewForTopicAndLanguage(selectedTopic, selectedLanguage);
    }
  }, [selectedTopic, selectedLanguage, user]);

  const loadReviewForTopicAndLanguage = async (topic: string, lang: string) => {
    const text = getRandomReviewForTopicAndLanguage(user, topic, lang, user.businessName);
    setGeneratedReviewText(text);
  };

  const handleShowAnotherReview = async () => {
    setIsAiLoading(true);

    // Briefly show wait state for 1 second for seamless feedback
    await new Promise((r) => setTimeout(r, 800));

    // Try Gemini AI generator first for fresh random 3-15 words lines
    const aiResults = await fetchAiReview(user.businessName, selectedTopic, selectedLanguage, user.tagline || user.description);
    setIsAiLoading(false);

    if (aiResults && aiResults.length > 0) {
      const randomAi = aiResults[Math.floor(Math.random() * aiResults.length)];
      setGeneratedReviewText(randomAi);
    } else {
      // Fallback to random template line from user's custom topic templates
      const nextText = getRandomReviewForTopicAndLanguage(user, selectedTopic, selectedLanguage, user.businessName);
      setGeneratedReviewText(nextText);
    }
  };

  const handleCopyAndOpenGoogle = () => {
    incrementUserStat(user.username, 'reviewClicks');
    if (generatedReviewText) {
      navigator.clipboard.writeText(generatedReviewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }

    setTimeout(() => {
      window.open(user.googleReviewUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  // If account is disabled or subscription expired, show inactive popup card
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
              ? `The GoReview subscription plan for ${user.businessName} expired on ${user.subscriptionExpiryDate || 'recently'}. Please renew your plan to reactivate live review collecting.`
              : `This business review profile is currently disabled by administration. Contact GoReview support to restore access.`}
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
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden my-auto p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-1.5 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
            <img
              src={user.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
              alt={user.businessName}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {user.businessName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5 leading-snug">
              {user.tagline}
            </p>
          </div>
        </div>

        {/* Section 1: Review Topic (User Specific) */}
        <div className="mb-6">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3">
            Review Topic
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {topics.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                      : 'bg-white text-slate-800 border border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Language (User Specific) */}
        <div className="mb-6">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3">
            Language
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                      : 'bg-white text-slate-800 border border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Generated Review (3-15 words) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Generated Review
            </h2>
            {isAiLoading && (
              <span className="text-xs text-blue-600 font-semibold flex items-center space-x-1 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Generating review... please wait</span>
              </span>
            )}
          </div>

          <textarea
            rows={4}
            value={isAiLoading ? 'Generating fresh review... please wait a few seconds.' : generatedReviewText}
            onChange={(e) => setGeneratedReviewText(e.target.value)}
            disabled={isAiLoading}
            className="w-full p-4 bg-slate-50/50 border border-slate-200/90 rounded-2xl text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all leading-relaxed"
            placeholder="Review text will appear here..."
          />
        </div>

        {/* Toast copied notification */}
        {copied && (
          <div className="mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Review text copied! Opening Google Review page...</span>
          </div>
        )}

        {/* Section 4: Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mb-6">
          {/* Show Another Review */}
          <button
            onClick={handleShowAnotherReview}
            disabled={isAiLoading}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Show Another Review</span>
          </button>

          {/* Copy & Open Google Review */}
          <button
            onClick={handleCopyAndOpenGoogle}
            disabled={isAiLoading}
            className="flex-1 py-3 px-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50/80 disabled:opacity-50 rounded-xl font-semibold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <Copy className="w-4 h-4" />
            <span>Copy & Open Google Review</span>
          </button>

          {/* Contact Us */}
          <button
            onClick={() => onNavigate(`/user/${user.username}/contact`)}
            className="py-3 px-5 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Us</span>
          </button>
        </div>

        {/* Footer Credit */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Powered by <span className="font-semibold text-slate-600">GoReview.in</span>
          </p>
        </div>
      </div>
    </div>
  );
};
