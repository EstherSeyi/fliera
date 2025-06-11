import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import type { Event, EventCategory, EventVisibility, GeneratedDP, PaginatedDPsResult, FlierTemplate } from "../types";

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
  user_text_inputs: string[];
  user_photo: File;
  generated_image_data: string; // Base64 data URL or public URL
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
  fetchPublicEvents: (
    page?: number,
    limit?: number,
    filters?: EventFilters
  ) => Promise<PaginatedEventsResult>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  uploadGeneratedDPImage: (dataUrl: string) => Promise<string>;
  saveGeneratedDP: (dpData: SaveDPData) => Promise<void>;
  fetchGeneratedDPsByUser: (
    page?: number,
    limit?: number
  ) => Promise<PaginatedDPsResult>;
  deleteGeneratedDP: (dpId: string) => Promise<void>;
  fetchFlierTemplates: () => Promise<FlierTemplate[]>;
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

      // Get current date in YYYY-MM-DD format for comparison
      const today = new Date().toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("visibility", "public")
        .gte("date", today) // Only fetch events that are today or in the future
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

  const fetchPublicEvents = async (
    page = 1,
    limit = 12,
    filters: EventFilters = {}
  ): Promise<PaginatedEventsResult> => {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get current date in YYYY-MM-DD format for comparison
      const today = new Date().toISOString().split('T')[0];

      // Build the base query for public events only (excluding past events)
      let countQuery = supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("visibility", "public")
        .gte("date", today); // Only include events that are today or in the future

      let dataQuery = supabase
        .from("events")
        .select("*")
        .eq("visibility", "public")
        .gte("date", today); // Only include events that are today or in the future

      // Apply filters
      if (filters.title) {
        const titleFilter = `%${filters.title}%`;
        countQuery = countQuery.ilike("title", titleFilter);
        dataQuery = dataQuery.ilike("title", titleFilter);
      }

      if (filters.category) {
        if (filters.category === 'other') {
          // For "other" category, include events where category is 'other', null, or empty string
          countQuery = countQuery.or("category.eq.other,category.is.null,category.eq.");
          dataQuery = dataQuery.or("category.eq.other,category.is.null,category.eq.");
        } else {
          // For all other categories, use exact match
          countQuery = countQuery.eq("category", filters.category);
          dataQuery = dataQuery.eq("category", filters.category);
        }
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
      console.error("Error fetching public events:", err);
      throw new Error("Failed to load events");
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
        if (filters.category === 'other') {
          // For "other" category, include events where category is 'other', null, or empty string
          countQuery = countQuery.or("category.eq.other,category.is.null,category.eq.");
          dataQuery = dataQuery.or("category.eq.other,category.is.null,category.eq.");
        } else {
          // For all other categories, use exact match
          countQuery = countQuery.eq("category", filters.category);
          dataQuery = dataQuery.eq("category", filters.category);
        }
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
      const filePath = `${user.id}/${fileName}`;

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

  const deleteEvent = async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // First, get the event to get the flyer URL
      const { data: eventData, error: fetchError } = await supabase
        .from("events")
        .select("flyer_url")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      if (!eventData) {
        throw new Error("Event not found or you don't have permission to delete it");
      }

      // Extract the file path from the flyer URL
      const url = new URL(eventData.flyer_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `event-flyers/${fileName}`;

      // Delete the flyer image from storage
      const { error: storageError } = await supabase.storage
        .from("event-flyers")
        .remove([filePath]);

      if (storageError) {
        console.warn("Failed to delete flyer from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete the event record from the database
      // Note: Related DPs will be automatically deleted due to CASCADE foreign key constraint
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Update local state if the event is in the current events list
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      throw new Error("Failed to delete event");
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

  const uploadGeneratedDPImage = async (dataUrl: string): Promise<string> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Convert base64 data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const dpFileName = `dp-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.png`;
      const dpPath = `${user.id}/${dpFileName}`;

      const { error: dpUploadError } = await supabase.storage
        .from("generated-dps")
        .upload(dpPath, blob, {
          contentType: "image/png",
        });

      if (dpUploadError) throw dpUploadError;

      // Get public URL for generated DP
      const {
        data: { publicUrl },
      } = supabase.storage.from("generated-dps").getPublicUrl(dpPath);

      return publicUrl;
    } catch (err) {
      console.error("Error uploading DP image:", err);
      throw new Error("Failed to upload DP image");
    }
  };

  const saveGeneratedDP = async (dpData: SaveDPData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // If the generated_image_data is a data URL, upload it first
      let generatedImageUrl = dpData.generated_image_data;
      
      if (dpData.generated_image_data.startsWith('data:')) {
        // Convert base64 data URL to blob and upload generated DP
        const response = await fetch(dpData.generated_image_data);
        const blob = await response.blob();

        const dpFileName = `dp-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.png`;
        const dpPath = `${user.id}/${dpFileName}`;

        const { error: dpUploadError } = await supabase.storage
          .from("generated-dps")
          .upload(dpPath, blob, {
            contentType: "image/png",
          });

        if (dpUploadError) throw dpUploadError;

        // Get public URL for generated DP
        const {
          data: { publicUrl },
        } = supabase.storage.from("generated-dps").getPublicUrl(dpPath);

        generatedImageUrl = publicUrl;
      }

      // Save DP record to database
      const { error: insertError } = await supabase.from("dps").insert({
        user_id: user.id,
        event_id: dpData.event_id,
        generated_image_url: generatedImageUrl,
        user_text_inputs: dpData.user_text_inputs,
      });

      if (insertError) throw insertError;
    } catch (err) {
      console.error("Error saving generated DP:", err);
      throw new Error("Failed to save your DP");
    }
  };

  const fetchFlierTemplates = async (): Promise<FlierTemplate[]> => {
    try {
      // Fetch flier templates with user information
      const { data, error } = await supabase
        .from("flier_templates")
        .select(`
          *,
          users!flier_templates_user_id_fkey(
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map the data to include createdBy field from the joined user data
      const templatesWithCreator = data?.map(template => ({
        ...template,
        createdBy: template.users?.full_name || undefined
      })) || [];

      return templatesWithCreator;
    } catch (err) {
      console.error("Error fetching flier templates:", err);
      throw new Error("Failed to load flier templates");
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
        fetchPublicEvents,
        updateEvent,
        deleteEvent,
        uploadGeneratedDPImage,
        saveGeneratedDP,
        fetchGeneratedDPsByUser,
        deleteGeneratedDP,
        fetchFlierTemplates,
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