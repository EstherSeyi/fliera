import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  title: string;
  template_image_url: string;
  user_image_placeholders: UserImagePlaceholder[];
  user_text_placeholders: UserTextPlaceholder[];
  template_placeholders: TemplatePlaceholder[];
  created_at: string;
  created_by?: string;
}

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
