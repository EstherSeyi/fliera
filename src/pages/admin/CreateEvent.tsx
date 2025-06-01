import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';
import { useEvents } from '../../context/EventContext';
import type { Event } from '../../types';

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [flyerUrl, setFlyerUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      date,
      description,
      flyerUrl,
      placeholderZones: {
        photo: { x: 50, y: 50, width: 200, height: 200 },
        text: { x: 50, y: 270, width: 200, height: 50 },
      },
    };

    addEvent(newEvent);
    navigate('/events');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Create New Event</h1>
          <p className="mt-2 text-secondary">Set up your event details and DP template</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-primary font-medium">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-primary font-medium">
              Event Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-primary font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="flyerUrl" className="block text-primary font-medium">
              Flyer Image URL
            </label>
            <input
              type="url"
              id="flyerUrl"
              value={flyerUrl}
              onChange={(e) => setFlyerUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter image URL"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </button>
        </form>
      </motion.div>
    </div>
  );
};