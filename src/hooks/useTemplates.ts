import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { PaginatedTemplatesResult, TemplateFilterType } from "../types";

export interface UserImagePlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  holeShape: "circle" | "rectangle";
}

export interface UserTextPlaceholder {
  id: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  labelText: string;
  text: string;
  fontStyle: "normal" | "bold" | "italic";
  width: number;
  height: number;
}

export interface TemplatePlaceholder {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  text?: string;
  labelText: string;
  fontStyle?: "normal" | "bold" | "italic";
  width?: number;
  height?: number;
}

export interface Template {
  id: string;
  user_id: string;
  title: string;
  template_image_url: string;
  user_image_placeholders: UserImagePlaceholder[];
  user_text_placeholders: UserTextPlaceholder[];
  template_placeholders: TemplatePlaceholder[];
  created_at: string;
  created_by?: string;
}

interface TemplateFilters {
  filterType: TemplateFilterType;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useTemplateList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTemplates = useCallback(
    async (
      page: number = 1,
      limit: number = 12,
      filters: TemplateFilters = { filterType: "all" }
    ): Promise<PaginatedTemplatesResult> => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error("You must be logged in to view templates");
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build the base query
        let countQuery = supabase
          .from("flier_templates")
          .select("*", { count: "exact", head: true });

        let dataQuery = supabase.from("flier_templates").select("*");

        // Apply filter type
        if (filters.filterType === "my") {
          countQuery = countQuery.eq("user_id", session.user.id);
          dataQuery = dataQuery.eq("user_id", session.user.id);
        } else if (filters.filterType === "others") {
          countQuery = countQuery.neq("user_id", session.user.id);
          dataQuery = dataQuery.neq("user_id", session.user.id);
        }
        // For "all", no additional filter is needed

        // Apply search filter
        if (filters.searchTerm) {
          const searchFilter = `%${filters.searchTerm}%`;
          countQuery = countQuery.ilike("title", searchFilter);
          dataQuery = dataQuery.ilike("title", searchFilter);
        }

        // Apply date filters
        if (filters.dateFrom) {
          countQuery = countQuery.gte("created_at", filters.dateFrom);
          dataQuery = dataQuery.gte("created_at", filters.dateFrom);
        }

        if (filters.dateTo) {
          // Add 23:59:59 to include the entire day
          const endOfDay = new Date(filters.dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          const dateToString = endOfDay.toISOString();

          countQuery = countQuery.lte("created_at", dateToString);
          dataQuery = dataQuery.lte("created_at", dateToString);
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
          templates: data || [],
          totalCount: count || 0,
        };
      } catch (err) {
        const error = err as Error;
        setError(error?.message || "Failed to load templates");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const deleteTemplate = async (id: string) => {
    try {
      setDeleting(id);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Login required");

      const { error } = await supabase
        .from("flier_templates")
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      setError(error?.message);
      throw error;
    } finally {
      setDeleting(null);
    }
  };

  return {
    loading,
    error,
    deleting,
    fetchTemplates,
    deleteTemplate,
  };
};

// Keep the old hook for backward compatibility with CreateTemplate page
export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("You must be logged in to view templates");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("flier_templates")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTemplates(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setDeleting(id);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Login required");

      const { error } = await supabase
        .from("flier_templates")
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const error = err as Error;
      setError(error?.message);
    } finally {
      setDeleting(null);
    }
  };

  return {
    templates,
    loading,
    error,
    deleting,
    fetchTemplates,
    deleteTemplate,
  };
};