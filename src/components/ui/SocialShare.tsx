import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Instagram, Link, Check } from 'lucide-react';
import { Button } from './Button';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description = '',
  image = '',
  className = '',
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url,
  };

  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(
      shareUrl,
      'share-window',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        aria-label="Share recipe"
      >
        <Share2 size={16} />
        Share
      </Button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 min-w-[200px] z-50 animate-slide-down">
            <h3 className="font-semibold text-gray-900 mb-3">Share Recipe</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => openShareWindow(shareUrls.facebook)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Facebook size={20} className="text-blue-600" />
                <span className="text-gray-900">Facebook</span>
              </button>
              
              <button
                onClick={() => openShareWindow(shareUrls.twitter)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Twitter size={20} className="text-blue-400" />
                <span className="text-gray-900">Twitter</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Link size={20} className="text-gray-600" />
                )}
                <span className="text-gray-900">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};