import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { UserCreditInfo } from '../types';

export const useUserCredits = () => {
  const { user } = useAuth();
  const [creditInfo, setCreditInfo] = useState<UserCreditInfo>({
    credits: 0,
    is_premium_user: false,
    eventsCreated: 0,
    totalDPsGenerated: 0,
    freeEventsRemaining: 3,
    freeDPsRemainingForCurrentEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditInfo = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user data including credits and free_events_used
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits, is_premium_user, free_events_used')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch user's events count
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (eventsError) throw eventsError;

      // Fetch user's total DPs generated
      const { count: dpsCount, error: dpsError } = await supabase
        .from('dps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (dpsError) throw dpsError;

      // Calculate free events remaining (max 3)
      const freeEventsUsed = userData?.free_events_used || 0;
      const freeEventsRemaining = Math.max(0, 3 - freeEventsUsed);

      // For free DPs calculation, we need to check DPs per event
      // For simplicity, we'll calculate total free DPs available across all events
      const totalFreeEventsCreated = Math.min(freeEventsUsed, 3);
      const totalFreeDPsAllowed = totalFreeEventsCreated * 100;
      const freeDPsRemainingForCurrentEvents = Math.max(0, totalFreeDPsAllowed - (dpsCount || 0));

      setCreditInfo({
        credits: userData?.credits || 0,
        is_premium_user: userData?.is_premium_user || false,
        eventsCreated: eventsCount || 0,
        totalDPsGenerated: dpsCount || 0,
        freeEventsRemaining,
        freeDPsRemainingForCurrentEvents,
      });
    } catch (err) {
      console.error('Error fetching credit info:', err);
      setError('Failed to load credit information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditInfo();
  }, [user]);

  return {
    creditInfo,
    loading,
    error,
    refetch: fetchCreditInfo,
  };
};