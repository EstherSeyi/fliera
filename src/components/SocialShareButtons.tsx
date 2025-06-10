import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';

interface SocialShareButtonsProps {
  imageUrl: string;
  title: string;
  description: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  imageUrl,
  title,
  description,
}) => {
  const encodedImageUrl = encodeURIComponent(imageUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedText = encodeURIComponent(`${title}: ${description}`);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodedText}%0A${encodedImageUrl}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedImageUrl}&quote=${encodedText}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedImageUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedImageUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white p-6 rounded-lg shadow-lg space-y-4 text-center"
    >
      <h3 className="text-xl font-semibold text-primary flex items-center justify-center">
        <Share2 className="w-5 h-5 mr-2" />
        Share Your DP
      </h3>
      <p className="text-secondary text-sm">
        Spread the word! Share your personalized display picture on social media.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {shareLinks.map((platform) => (
          <motion.a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors ${platform.color}`}
          >
            <platform.icon className="w-5 h-5 mr-2" />
            {platform.name}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};