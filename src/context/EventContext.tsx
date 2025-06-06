import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import type { Event } from "../types";

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  addEvent: (event: Event) => Promise<void>;
  getEvent: (id: string) => Promise<Event | null>;
  refreshEvents: () => Promise<void>;
  fetchEventsByUser: () => Promise<Event[]>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByUser = async (): Promise<Event[]> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      console.error("Error fetching user events:", err);
      throw new Error("Failed to load your events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (eventData: Event) => {
    const { id: _, ...rest } = eventData;

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from("events")
        .insert({ ...rest, user_id: user?.id })
        .select()
        .single();

      if (insertError) throw insertError;

      setEvents((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Error adding event:", err);
      throw new Error("Failed to create event");
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const { error: updateError } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Update local state if the event is in the current events list
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? { ...event, ...eventData } : event
        )
      );
    } catch (err) {
      console.error("Error updating event:", err);
      throw new Error("Failed to update event");
    }
  };

  const getEvent = async (id: string): Promise<Event | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      console.error("Error fetching event:", err);
      throw new Error("Failed to fetch event");
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        addEvent,
        getEvent,
        refreshEvents: fetchEvents,
        fetchEventsByUser,
        updateEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};