import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw, Check, AlertCircle, FileCode } from 'lucide-react';
import { BusinessUser } from '../../types/user';
import { getStoredReviewDataMap, saveReviewDataMap } from '../../utils/reviewData';

interface ImportExportModalProps {
  users: BusinessUser[];
  isOpen: boolean;
  onClose: () => void;
  onImport: (users: BusinessUser[]) => void;
  onResetToDefaults: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  users,
  isOpen,
  onClose,
  onImport,
  onResetToDefaults
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [reviewsJsonInput, setReviewsJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'clients' | 'reviews'>('reviews');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadClientsBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `goreview_clients_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadReviewsJson = () => {
    const reviewData = getStoredReviewDataMap();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reviewData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `reviews.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClientsImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('Imported data must be an array of client objects');
      }

      onImport(parsed);
      setSuccessMsg(`Successfully imported ${parsed.length} client businesses!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
    }
  };

  const handleReviewsImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const parsed = JSON.parse(reviewsJsonInput);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('reviews.json must be an object with business username keys');
      }

      const existing = getStoredReviewDataMap();
      const updated = { ...existing, ...parsed };
      saveReviewDataMap(updated);

      setSuccessMsg('Successfully imported custom business review topics & phrases!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid reviews.json format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'clients' | 'reviews') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        if (target === 'clients') {
          setJsonInput(event.target.result as string);
        } else {
          setReviewsJsonInput(event.target.result as string);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 relative overflow-hidden border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-1">Backup & Topic Reviews Data</h3>
        <p className="text-xs text-slate-500 mb-4">
          Upload or download <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono">reviews.json</code> for business-wise topics & languages, or back up client profiles.
        </p>

        {/* Tab selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'reviews' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Manage reviews.json</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'clients' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Clients JSON Backup</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'reviews' ? (
          <div>
            {/* Download current reviews.json */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Download reviews.json</h4>
                <p className="text-xs text-blue-700 mt-0.5">Export custom business topics, languages & review text templates</p>
              </div>
              <button
                onClick={handleDownloadReviewsJson}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download reviews.json</span>
              </button>
            </div>

            {/* Upload reviews.json */}
            <form onSubmit={handleReviewsImportSubmit} className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Upload custom reviews.json
                </label>
                <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select File</span>
                  <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'reviews')} className="hidden" />
                </label>
              </div>

              <textarea
                rows={6}
                value={reviewsJsonInput}
                onChange={(e) => setReviewsJsonInput(e.target.value)}
                placeholder='Paste content of reviews.json here...'
                className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={!reviewsJsonInput.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow transition-colors"
              >
                Upload & Save Business Reviews
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Export Clients */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Export Current Clients</h4>
                <p className="text-xs text-slate-500 mt-0.5">Backup all {users.length} registered business profiles</p>
              </div>
              <button
                onClick={handleDownloadClientsBackup}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Clients JSON</span>
              </button>
            </div>

            {/* Import Clients */}
            <form onSubmit={handleClientsImportSubmit} className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Import Clients JSON
                </label>
                <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                  <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'clients')} className="hidden" />
                </label>
              </div>

              <textarea
                rows={5}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste JSON array of clients here...'
                className="w-full p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={!jsonInput.trim()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition-colors"
              >
                Import Client Profiles
              </button>
            </form>
          </div>
        )}

        {/* Action 3: Reset to Default Demo Data */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Restore default demo clients and reviews.json</span>
          <button
            type="button"
            onClick={() => {
              onResetToDefaults();
              localStorage.removeItem('goreview_business_topics_reviews_v1');
              setSuccessMsg('Restored default client profiles and review templates!');
              setTimeout(() => onClose(), 1200);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
