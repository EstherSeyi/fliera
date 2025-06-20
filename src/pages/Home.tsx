import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Palette, Users, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { CategoryCardSkeleton } from "../components/CategoryCardSkeleton";
import { DPGenerationTutorial } from "../components/DPGenerationTutorial";

export const Home: React.FC = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);

  const categories = [
    {
      id: "business",
      title: "Business",
      image:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
    },
    {
      id: "technology",
      title: "Technology",
      image:
        "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
    },
    {
      id: "music",
      title: "Music",
      image:
        "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
    },
    {
      id: "social",
      title: "Social",
      image:
        "https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg",
    },
    {
      id: "sports",
      title: "Sports",
      image:
        "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg",
    },
    {
      id: "activism",
      title: "Activism",
      image:
        "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate your personalized DP in seconds with our optimized processing engine",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your photos are processed securely and never stored on our servers",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Palette,
      title: "Fully Customizable",
      description: "Choose from multiple templates, fonts, colors, and styling options",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Users,
      title: "Event Organizer Friendly",
      description: "Create events and let attendees generate their own branded DPs",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Download,
      title: "High Quality Output",
      description: "Download your DPs in high resolution, perfect for all social platforms",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Smart cropping, text suggestions, and automated styling for the best results",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  useEffect(() => {
    // Preload images
    categories.forEach((category) => {
      const img = new Image();
      img.src = category.image;
      img.onload = () => {
        setLoadedImagesCount((prev) => {
          const newCount = prev + 1;
          if (newCount === categories.length) {
            setImagesLoaded(true);
          }
          return newCount;
        });
      };
    });
  }, []);

  return (
    <div className="space-y-16 animate-fade-in text-sans">
      {/* Hero Section */}
      <section className="text-start space-y-6 py-16">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Personalized DPs.
          <br />
          For your events.
        </motion.h1>
        <motion.p
          className="text-base md:text-xl text-secondary max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create stunning, personalized display pictures for your event
          attendees in minutes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/events"
            className="inline-flex items-center px-6 py-3 bg-thistle text-primary  hover:bg-thistle/90 transition-colors duration-200 animate-scale active:scale-95"
          >
            Browse Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Key Features Section */}
      <section className="space-y-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Why Choose EventDP?
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            The most powerful and user-friendly platform for creating event display pictures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Events By Categories Section */}
      <section className="space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Events By Categories
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Discover events across different categories and create your perfect DP
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!imagesLoaded
            ? // Show skeleton loaders while images are loading
              Array.from({ length: categories.length }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CategoryCardSkeleton href={`/events?category=${categories[index]?.id || ''}`} />
                </motion.div>
              ))
            : // Show actual category cards once images are loaded
              categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/events?category=${category.id}`}
                    className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 block"
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
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      {/* DP Generation Tutorial Section */}
      <DPGenerationTutorial />

      {/* Call to Action Section */}
      <section className="py-16 bg-primary text-neutral rounded-2xl">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your Event's Signature DP?
            </h2>
            <p className="text-lg text-neutral/90 max-w-2xl mx-auto mb-8">
              Join thousands of event organizers and attendees who trust EventDP for their display picture needs. 
              Start creating memorable, personalized DPs today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/events"
                  className="inline-flex items-center px-8 py-4 bg-thistle text-primary rounded-lg font-semibold shadow-lg hover:bg-thistle/90 transition-all duration-300"
                >
                  Browse Events
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/admin/create"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-neutral text-neutral rounded-lg font-semibold hover:bg-neutral hover:text-primary transition-all duration-300"
                >
                  Create Event
                  <Sparkles className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
            </div>
            <p className="text-sm text-neutral/70 mt-6">
              Free to use • No credit card required • Instant results
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section (Placeholder) */}
      <section className="space-y-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Hear from event organizers and attendees who love using EventDP
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Wedding Planner",
              content: "EventDP made it so easy for our wedding guests to create beautiful, personalized DPs. The quality is amazing!",
              rating: 5,
            },
            {
              name: "Tech Conference 2024",
              role: "Event Organizer",
              content: "Our attendees loved being able to create custom DPs for our tech conference. Great engagement tool!",
              rating: 5,
            },
            {
              name: "Michael Chen",
              role: "Event Attendee",
              content: "Super easy to use and the results look professional. Perfect for sharing on social media!",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-secondary mb-4 italic">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-primary">{testimonial.name}</p>
                <p className="text-sm text-secondary">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};