import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import type { Event, EventCategory, EventVisibility, GeneratedDP, PaginatedDPsResult } from "../types";

interface PaginatedEventsResult {
  events: Event[];
  totalCount: number;
}

interface EventFilters {
  title?: string;
  category?: EventCategory;
  visibility?: EventVisibility;
  dateFrom?: string;
  dateTo?: string;
}

interface SaveDPData {
  event_id: string;
  user_name: string;
  user_photo: File;
  generated_image_data: string; // Base64 data URL
}

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  addEvent: (event: Event) => Promise<void>;
  getEvent: (id: string) => Promise<Event | null>;
  refreshEvents: () => Promise<void>;
  fetchEventsByUser: (
    page?: number,
    limit?: number,
    filters?: EventFilters
  ) => Promise<PaginatedEventsResult>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  saveGeneratedDP: (dpData: SaveDPData) => Promise<void>;
  fetchGeneratedDPsByUser: (
    page?: number,
    limit?: number
  ) => Promise<PaginatedDPsResult>;
  deleteGeneratedDP: (dpId: string) => Promise<void>;
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

  const fetchEventsByUser = async (
    page = 1,
    limit = 10,
    filters: EventFilters = {}
  ): Promise<PaginatedEventsResult> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build the base query
      let countQuery = supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      let dataQuery = supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id);

      // Apply filters
      if (filters.title) {
        const titleFilter = `%${filters.title}%`;
        countQuery = countQuery.ilike("title", titleFilter);
        dataQuery = dataQuery.ilike("title", titleFilter);
      }

      if (filters.category) {
        countQuery = countQuery.eq("category", filters.category);
        dataQuery = dataQuery.eq("category", filters.category);
      }

      if (filters.visibility) {
        countQuery = countQuery.eq("visibility", filters.visibility);
        dataQuery = dataQuery.eq("visibility", filters.visibility);
      }

      if (filters.dateFrom) {
        countQuery = countQuery.gte("date", filters.dateFrom);
        dataQuery = dataQuery.gte("date", filters.dateFrom);
      }

      if (filters.dateTo) {
        countQuery = countQuery.lte("date", filters.dateTo);
        dataQuery = dataQuery.lte("date", filters.dateTo);
      }

      // Execute count query
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Execute data query with pagination and ordering
      const { data, error: fetchError } = await dataQuery
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;

      return {
        events: data || [],
        totalCount: count || 0,
      };
    } catch (err) {
      console.error("Error fetching user events:", err);
      throw new Error("Failed to load your events");
    }
  };

  const fetchGeneratedDPsByUser = async (
    page = 1,
    limit = 12
  ): Promise<PaginatedDPsResult> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get total count
      const { count, error: countError } = await supabase
        .from("dps")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) throw countError;

      // Get paginated data with event details
      const { data, error: fetchError } = await supabase
        .from("dps")
        .select(`
          *,
          event:events(title, date)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;

      return {
        dps: data || [],
        totalCount: count || 0,
      };
    } catch (err) {
      console.error("Error fetching user DPs:", err);
      throw new Error("Failed to load your DPs");
    }
  };

  const deleteGeneratedDP = async (dpId: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // First, get the DP record to get the image URL
      const { data: dpData, error: fetchError } = await supabase
        .from("dps")
        .select("generated_image_url")
        .eq("id", dpId)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      if (!dpData) {
        throw new Error("DP not found or you don't have permission to delete it");
      }

      // Extract the file path from the URL
      const url = new URL(dpData.generated_image_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `generated-dps/${fileName}`;

      // Delete the image file from storage
      const { error: storageError } = await supabase.storage
        .from("generated-dps")
        .remove([filePath]);

      if (storageError) {
        console.warn("Failed to delete image from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete the DP record from the database
      const { error: deleteError } = await supabase
        .from("dps")
        .delete()
        .eq("id", dpId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error("Error deleting DP:", err);
      throw new Error("Failed to delete DP");
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

  const saveGeneratedDP = async (dpData: SaveDPData) => {
    try {
      // Convert base64 data URL to blob and upload generated DP
      const response = await fetch(dpData.generated_image_data);
      const blob = await response.blob();

      const dpFileName = `dp-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.png`;
      const dpPath = `generated-dps/${dpFileName}`;

      const { error: dpUploadError } = await supabase.storage
        .from("generated-dps")
        .upload(dpPath, blob, {
          contentType: "image/png",
        });

      if (dpUploadError) throw dpUploadError;

      // Get public URL for generated DP
      const {
        data: { publicUrl: generatedImageUrl },
      } = supabase.storage.from("generated-dps").getPublicUrl(dpPath);

      // Save DP record to database
      const { error: insertError } = await supabase.from("dps").insert({
        user_id: user?.id || null,
        event_id: dpData.event_id,
        generated_image_url: generatedImageUrl,
        user_name: dpData.user_name,
      });

      if (insertError) throw insertError;
    } catch (err) {
      console.error("Error saving generated DP:", err);
      throw new Error("Failed to save your DP");
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
        saveGeneratedDP,
        fetchGeneratedDPsByUser,
        deleteGeneratedDP,
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