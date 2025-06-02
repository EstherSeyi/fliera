import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { useEvents } from '../../context/EventContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Event } from '../../types';
import { EventDetailsStep } from './steps/EventDetailsStep';
import { ImagePlaceholderStep } from './steps/ImagePlaceholderStep';
import { TextPlaceholderStep } from './steps/TextPlaceholderStep';
import { PreviewStep } from './steps/PreviewStep';

type FormData = Omit<Event, 'id' | 'user_id' | 'created_at'>;

const STEPS = [
  { id: 'details', title: 'Event Details' },
  { id: 'image', title: 'Image Placeholder' },
  { id: 'text', title: 'Text Placeholders' },
  { id: 'preview', title: 'Preview' },
];

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<FormData>({
    defaultValues: {
      title: '',
      date: '',
      description: '',
      flyer_url: '',
      image_placeholders: [{ x: 50, y: 50, width: 200, height: 200 }],
      text_placeholders: [{
        x: 50,
        y: 270,
        width: 200,
        height: 50,
        text: '',
        fontSize: 24,
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        textTransform: 'none',
        fontWeight: '600'
      }]
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...data
      };
      await addEvent(newEvent);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const isValid = await methods.trigger(Object.keys(methods.getValues()) as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Create New Event</h1>
          <p className="mt-2 text-secondary">Set up your event details and DP template</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-4 h-0.5 bg-gray-200">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${index < currentStep ? '100%' : '0%'}` }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 0 && <EventDetailsStep />}
                {currentStep === 1 && <ImagePlaceholderStep />}
                {currentStep === 2 && <TextPlaceholderStep />}
                {currentStep === 3 && <PreviewStep />}
              </AnimatePresence>

              <div className="flex justify-between pt-6 border-t">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center px-4 py-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                )}
                
                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto flex items-center px-6 py-2 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
                  >
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto flex items-center px-6 py-2 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Creating event...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Event
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </motion.div>
    </div>
  );
};