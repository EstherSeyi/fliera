import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Image as ImageIcon, Eye, Edit, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getPlainTextSnippet } from '../lib/utils';
import type { Event } from '../types';

interface DashboardStats {
  totalEvents: number;
  totalDPs: number;
  totalParticipants: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalDPs: 0,
    totalParticipants: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchRecentEvents();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      setLoadingStats(true);
      setError(null);

      // Fetch total events created by user
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (eventsError) throw eventsError;

      // Fetch total DPs generated for user's events
      const { data: userEvents, error: userEventsError } = await supabase
        .from('events')
        .select('id')
        .eq('user_id', user.id);

      if (userEventsError) throw userEventsError;

      const eventIds = userEvents?.map(event => event.id) || [];

      let dpsCount = 0;
      let participantsCount = 0;

      if (eventIds.length > 0) {
        // Fetch total DPs for user's events
        const { count: totalDPs, error: dpsError } = await supabase
          .from('dps')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds);

        if (dpsError) throw dpsError;
        dpsCount = totalDPs || 0;

        // Fetch unique participants (users who generated DPs for user's events)
        const { data: participantsData, error: participantsError } = await supabase
          .from('dps')
          .select('user_id')
          .in('event_id', eventIds)
          .not('user_id', 'is', null);

        if (participantsError) throw participantsError;

        // Count unique participants
        const uniqueParticipants = new Set(
          participantsData?.map(dp => dp.user_id).filter(Boolean) || []
        );
        participantsCount = uniqueParticipants.size;
      }

      setStats({
        totalEvents: eventsCount || 0,
        totalDPs: dpsCount,
        totalParticipants: participantsCount,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentEvents = async () => {
    if (!user) return;

    try {
      setLoadingEvents(true);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentEvents(data || []);
    } catch (err) {
      console.error('Error fetching recent events:', err);
      setError('Failed to load recent events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    
    // Remove loading animation from container
    if (container) {
      container.classList.remove('animate-pulse', 'bg-gray-200');
    }
    
    // Make image visible
    img.classList.remove('opacity-0');
    img.classList.add('opacity-100');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    
    // Set fallback image
    img.src = "https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
    
    // Remove loading animation from container
    if (container) {
      container.classList.remove('animate-pulse', 'bg-gray-200');
    }
    
    // Make image visible
    img.classList.remove('opacity-0');
    img.classList.add('opacity-100');
  };

  const StatCard: React.FC<{
    label: string;
    value: number;
    icon: React.ElementType;
    loading: boolean;
  }> = ({ label, value, icon: Icon, loading }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-secondary">{label}</p>
          {loading ? (
            <div className="mt-2 space-y-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          ) : (
            <p className="text-3xl font-bold text-primary mt-2">{value.toLocaleString()}</p>
          )}
        </div>
        <Icon className="w-8 h-8 text-accent" />
      </div>
    </div>
  );

  const RecentEventsSkeleton: React.FC = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary mt-2">
            Welcome back! Here's an overview of your events and activity.
          </p>
        </div>
        <Link
          to="/admin/create"
          className="flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatCard
          label="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          loading={loadingStats}
        />
        <StatCard
          label="Total Participants"
          value={stats.totalParticipants}
          icon={Users}
          loading={loadingStats}
        />
        <StatCard
          label="DPs Generated"
          value={stats.totalDPs}
          icon={ImageIcon}
          loading={loadingStats}
        />
      </motion.div>

      {/* Recent Events Section */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Recent Events</h2>
          <Link
            to="/my-events"
            className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            View All Events →
          </Link>
        </div>

        {loadingEvents ? (
          <RecentEventsSkeleton />
        ) : recentEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No events created yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first event to generate personalized DPs
            </p>
            <Link
              to="/admin/create"
              className="inline-flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-lg object-cover transition-opacity duration-300 opacity-0"
                    src={event.flyer_url}
                    alt={event.title}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/events/${event.id}`}
                    className="text-lg font-medium text-primary hover:text-primary/80 transition-colors block truncate"
                  >
                    {event.title}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {formatDate(event.date)}</span>
                    {event.description && (
                      <span className="truncate">
                        {getPlainTextSnippet(event.description, 60)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                  <Link
                    to={`/admin/edit/${event.id}`}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};