import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, MessageSquare, Check, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { LoadingSpinner } from './LoadingSpinner';

interface AICaptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveCaption: (caption: string) => void;
  onSkipCaption: () => void;
  eventTitle: string;
  platform: string;
}

type DialogStage = 'prompt' | 'form' | 'preview';

interface CaptionFormData {
  role: string;
  note: string;
}

const ROLE_OPTIONS = [
  { value: 'attendee', label: 'Attendee' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'other', label: 'Other' },
];

export const AICaptionDialog: React.FC<AICaptionDialogProps> = ({
  isOpen,
  onClose,
  onApproveCaption,
  onSkipCaption,
  eventTitle,
  platform,
}) => {
  const [currentStage, setCurrentStage] = useState<DialogStage>('prompt');
  const [formData, setFormData] = useState<CaptionFormData>({
    role: '',
    note: '',
  });
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStage('prompt');
      setFormData({ role: '', note: '' });
      setGeneratedCaption('');
      setIsGenerating(false);
    }
  }, [isOpen]);

  const generateDummyCaption = async (data: CaptionFormData): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const roleText = data.role === 'other' ? 'participant' : data.role;
    const baseCaption = `Excited to be ${data.role === 'attendee' ? 'attending' : `participating as a ${roleText} in`} ${eventTitle}! 🎉`;
    
    const additionalText = data.note 
      ? ` ${data.note}` 
      : ` Looking forward to an amazing experience! #${eventTitle.replace(/\s+/g, '')} #EventDP`;

    return baseCaption + additionalText;
  };

  const handleYesCaption = () => {
    setCurrentStage('form');
  };

  const handleNoCaption = () => {
    onClose();
    onSkipCaption();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) return;

    setIsGenerating(true);
    try {
      const caption = await generateDummyCaption(formData);
      setGeneratedCaption(caption);
      setCurrentStage('preview');
    } catch (error) {
      console.error('Error generating caption:', error);
      // Handle error - maybe show a toast or fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    onClose();
    onApproveCaption(generatedCaption);
  };

  const handleBack = () => {
    if (currentStage === 'form') {
      setCurrentStage('prompt');
    } else if (currentStage === 'preview') {
      setCurrentStage('form');
    }
  };

  const renderPromptStage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            AI-Generated Caption
          </h3>
          <p className="text-secondary">
            Would you like us to create a personalized caption for your {platform} post?
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleYesCaption}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Yes, generate caption
        </button>
        <button
          onClick={handleNoCaption}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          No, share without caption
        </button>
      </div>
    </motion.div>
  );

  const renderFormStage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary mb-2">
          Tell us about yourself
        </h3>
        <p className="text-secondary">
          Help us create the perfect caption for your post
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What's your role? *
          </label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Optional note
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Anything specific you want included in the caption?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500">
            {formData.note.length}/200 characters
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!formData.role || isGenerating}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner className="mr-2" />
                Generating...
              </>
            ) : (
              <>
                Generate Caption
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderPreviewStage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary mb-2">
          Your AI-Generated Caption
        </h3>
        <p className="text-secondary">
          Review and approve your personalized caption
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800 leading-relaxed">{generatedCaption}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Preview:</strong> This caption will be shared along with your DP on {platform}
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleApprove}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
        >
          <Check className="w-5 h-5 mr-2" />
          Approve & Share
        </button>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to {platform}</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {currentStage === 'prompt' && renderPromptStage()}
          {currentStage === 'form' && renderFormStage()}
          {currentStage === 'preview' && renderPreviewStage()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};