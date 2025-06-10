import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { AICaptionDialog } from './AICaptionDialog';

interface SocialShareButtonsProps {
  imageUrl: string;
  title: string;
  description: string;
}

interface SocialPlatform {
  name: string;
  icon: React.ElementType;
  color: string;
  getShareUrl: (imageUrl: string, text: string) => string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  imageUrl,
  title,
  description,
}) => {
  const [showCaptionDialog, setShowCaptionDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

  const socialPlatforms: SocialPlatform[] = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-[#25D366] hover:bg-[#1DA851]',
      getShareUrl: (imageUrl: string, text: string) => {
        const encodedText = encodeURIComponent(text);
        return `https://wa.me/?text=${encodedText}`;
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166FE5]',
      getShareUrl: (imageUrl: string, text: string) => {
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(window.location.href);
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      },
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-[#000000] hover:bg-[#1a1a1a]',
      getShareUrl: (imageUrl: string, text: string) => {
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(window.location.href);
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      },
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#004182]',
      getShareUrl: (imageUrl: string, text: string) => {
        const encodedTitle = encodeURIComponent(title);
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(window.location.href);
        return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`;
      },
    },
  ];

  const handlePlatformClick = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setShowCaptionDialog(true);
  };

  const handleApproveCaption = (caption: string) => {
    if (!selectedPlatform) return;

    const shareUrl = selectedPlatform.getShareUrl(imageUrl, caption);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSkipCaption = () => {
    if (!selectedPlatform) return;

    // Create default text without AI caption
    const defaultText = `Check out my personalized DP for ${title}! ${description}`;
    const shareUrl = selectedPlatform.getShareUrl(imageUrl, defaultText);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleDialogClose = () => {
    setShowCaptionDialog(false);
    setSelectedPlatform(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-lg space-y-4 text-center border border-gray-100"
      >
        <h3 className="text-xl font-semibold text-primary flex items-center justify-center">
          <Share2 className="w-5 h-5 mr-2" />
          Share Your DP
        </h3>
        <p className="text-secondary text-sm">
          Spread the word! Share your personalized display picture on social media.
        </p>
        <div className="flex justify-center gap-4">
          {socialPlatforms.map((platform) => (
            <motion.button
              key={platform.name}
              onClick={() => handlePlatformClick(platform)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:shadow-xl ${platform.color}`}
              title={`Share on ${platform.name}`}
            >
              <platform.icon className="w-6 h-6" />
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Click any platform to share with an optional AI-generated caption
        </p>
      </motion.div>

      <AICaptionDialog
        isOpen={showCaptionDialog}
        onClose={handleDialogClose}
        onApproveCaption={handleApproveCaption}
        onSkipCaption={handleSkipCaption}
        eventTitle={title}
        platform={selectedPlatform?.name || ''}
      />
    </>
  );
};