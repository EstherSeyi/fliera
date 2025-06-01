import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const categories = [
    { id: 'business', title: 'Business', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' },
    { id: 'technology', title: 'Technology', image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg' },
    { id: 'music', title: 'Music', image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg' },
    { id: 'social', title: 'Social', image: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg' },
    { id: 'sports', title: 'Sports', image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg' },
    { id: 'activism', title: 'Activism', image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg' },
  ];

  return (
    <div className="space-y-16 animate-fade-in text-sans">
      <section className="text-center space-y-6 py-16">
        <motion.h1 
          className="text-6xl font-bold text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Personalized DPs.
          <br />
          For your events.
        </motion.h1>
        <motion.p 
          className="text-xl text-secondary max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create stunning, personalized display pictures for your event attendees in minutes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/events"
            className="inline-flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors duration-200 animate-scale active:scale-95"
          >
            Browse Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-primary text-center">Events By Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-neutral transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold">{category.title}</h3>
                <ArrowRight className="mt-2 w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};