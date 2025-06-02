import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Event } from '../types';

interface EventContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  getEvent: (id: string) => Event | undefined;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const sampleEvent: Event = {
  id: '1',
  title: 'Tech Conference 2024',
  date: '2024-04-15',
  description: 'Join us for the biggest tech conference of the year!',
  flyer_url: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
  image_placeholders: [
    { x: 50, y: 50, width: 200, height: 200 }
  ],
  text_placeholders: [
    {
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
    }
  ]
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('events');
    return savedEvents ? JSON.parse(savedEvents) : [sampleEvent];
  });

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Event) => {
    setEvents((prev) => [...prev, event]);
  };

  const getEvent = (id: string) => {
    return events.find((event) => event.id === id);
  };

  return (
    <EventContext.Provider value={{ events, addEvent, getEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};