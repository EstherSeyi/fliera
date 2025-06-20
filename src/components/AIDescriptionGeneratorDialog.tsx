import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Clock, MessageSquare, Check, ArrowRight, X } from 'lucide-react';
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
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import type { AIDescriptionGeneratorProps, AIDescriptionFormData, DescriptionTone } from '../types';

type DialogStage = 'form' | 'generating' | 'preview';

const TONE_OPTIONS: { value: DescriptionTone; label: string; description: string }[] = [
  { value: 'none', label: 'No specific tone', description: 'Let AI choose the best tone' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
  { value: 'exciting', label: 'Exciting', description: 'Energetic and enthusiastic' },
  { value: 'informative', label: 'Informative', description: 'Educational and detailed' },
  { value: 'creative', label: 'Creative', description: 'Artistic and imaginative' },
  { value: 'formal', label: 'Formal', description: 'Traditional and ceremonial' },
];

export const AIDescriptionGeneratorDialog: React.FC<AIDescriptionGeneratorProps> = ({
  isOpen,
  onClose,
  onDescriptionGenerated,
  initialTitle = '',
  initialDate = '',
}) => {
  const { showToast } = useToast();
  const [currentStage, setCurrentStage] = useState<DialogStage>('form');
  const [formData, setFormData] = useState<AIDescriptionFormData>({
    title: '',
    date: '',
    tone: 'none',
    additionalNotes: '',
  });
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStage('form');
      setFormData({
        title: initialTitle,
        date: initialDate,
        tone: 'none',
        additionalNotes: '',
      });
      setGeneratedDescription('');
      setIsGenerating(false);
    }
  }, [isOpen, initialTitle, initialDate]);

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Event title is required', 'error');
      return;
    }

    setIsGenerating(true);
    setCurrentStage('generating');

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: {
          title: formData.title,
          date: formData.date,
          tone: formData.tone,
          additionalNotes: formData.additionalNotes,
        },
      });

      if (error) {
        console.error('Error invoking Edge Function:', error);
        throw new Error(error.message || 'Failed to generate description');
      }

      if (data && data.description) {
        setGeneratedDescription(data.description);
        setCurrentStage('preview');
      } else {
        throw new Error('No description received from AI');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      showToast('Failed to generate description. Please try again.', 'error');
      
      // Create a fallback description
      const fallbackDescription = `Join us for ${formData.title}${formData.date ? ` on ${formatDateForDisplay(formData.date)}` : ''}. ${formData.additionalNotes || 'This promises to be an amazing event you won\'t want to miss!'}`;
      
      setGeneratedDescription(fallbackDescription);
      setCurrentStage('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    onDescriptionGenerated(generatedDescription);
    onClose();
  };

  const handleBack = () => {
    if (currentStage === 'preview') {
      setCurrentStage('form');
    }
  };

  const renderFormStage = () => (
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
            AI Description Generator
          </h3>
          <p className="text-secondary">
            Let AI create an engaging description for your event
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Enter your event title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Event Date & Time
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          {formData.date && (
            <p className="text-xs text-gray-500">
              {formatDateForDisplay(formData.date)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tone
          </label>
          <Select
            value={formData.tone}
            onValueChange={(value: DescriptionTone) => setFormData(prev => ({ ...prev, tone: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map(({ value, label, description }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-gray-500">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            placeholder="Any specific details you want included in the description?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary resize-none"
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-gray-500">
            {formData.additionalNotes.length}/300 characters
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.title.trim() || isGenerating}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Description
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderGeneratingStage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6 py-8"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
        <LoadingSpinner className="text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          Generating Description...
        </h3>
        <p className="text-secondary">
          AI is crafting the perfect description for your event
        </p>
      </div>
      <div className="flex justify-center">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
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
          Generated Description
        </h3>
        <p className="text-secondary">
          Review and approve your AI-generated event description
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-auto">
              {generatedDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Preview:</strong> This description will be used for your event. You can always edit it later.
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
          Use This Description
        </button>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Description Generator</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {currentStage === 'form' && renderFormStage()}
          {currentStage === 'generating' && renderGeneratingStage()}
          {currentStage === 'preview' && renderPreviewStage()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};