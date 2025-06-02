import React from 'react';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import type { Event } from '../../../types';

export const EventDetailsStep: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<Event>();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label htmlFor="title" className="block text-primary font-medium">
          Event Title
        </label>
        <input
          type="text"
          id="title"
          {...register('title', { required: 'Title is required' })}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-primary font-medium">
          Event Date
        </label>
        <input
          type="date"
          id="date"
          {...register('date', { required: 'Date is required' })}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-primary font-medium">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary h-32"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="flyer_url" className="block text-primary font-medium">
          Flyer Image URL
        </label>
        <input
          type="url"
          id="flyer_url"
          {...register('flyer_url', { 
            required: 'Flyer URL is required',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Must be a valid URL'
            }
          })}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Enter image URL"
        />
        {errors.flyer_url && (
          <p className="text-red-500 text-sm">{errors.flyer_url.message}</p>
        )}
      </div>
    </motion.div>
  );
};