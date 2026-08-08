import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, ExternalLink, X, Copy, Check, Sparkles } from 'lucide-react';
import { BusinessUser } from '../types/user';
import { getUserFullUrls } from '../utils/urlUtils';

interface QRCodeModalProps {
  user: BusinessUser;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ user, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'review' | 'contact'>('review');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const urls = getUserFullUrls(user);
  const currentUrl = activeTab === 'review' ? urls.reviewUrl : urls.contactUrl;

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          currentUrl,
          {
            width: 280,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
              dark: '#0F172A',
              light: '#FFFFFF'
            }
          },
          (error) => {
            if (error) console.error('QR code generation error:', error);
          }
        );
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, activeTab, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${user.username}_${activeTab}_qr.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user.businessName}</h3>
            <p className="text-xs text-slate-500 font-mono">/user/{user.username}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-5 text-sm font-medium">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'review'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Review QR
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'contact'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Digital Contact QR
          </button>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200/80 mb-5 relative group">
          <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 mb-3">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
          <p className="text-xs text-center text-slate-500 font-medium">
            Scan to open {activeTab === 'review' ? 'Google Review Page' : 'Contact Us Page'}
          </p>
        </div>

        {/* URL Link Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-600 truncate mr-2">{currentUrl}</span>
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Link</span>
          </a>
        </div>
      </div>
    </div>
  );
};
