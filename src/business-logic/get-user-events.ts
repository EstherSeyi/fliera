import { Event, EventCategory, EventVisibility } from "../types";
import { supabase } from "../lib/supabase";

export interface EventFilters {
  title?: string;
  category?: EventCategory;
  visibility?: EventVisibility;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedEventsResult {
  events: Event[];
  totalCount: number;
}

export const getUserEvents = async (
  userId: string,
  page = 1,
  limit = 10,
  filters: EventFilters = {}
): Promise<PaginatedEventsResult> => {
  const offset = (page - 1) * limit;

  let countQuery = supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  let dataQuery = supabase.from("events").select("*").eq("user_id", userId);

  if (filters.title) {
    const titleFilter = `%${filters.title}%`;
    countQuery = countQuery.ilike("title", titleFilter);
    dataQuery = dataQuery.ilike("title", titleFilter);
  }

  if (filters.category) {
    if (filters.category === "other") {
      countQuery = countQuery.or(
        "category.eq.other,category.is.null,category.eq."
      );
      dataQuery = dataQuery.or(
        "category.eq.other,category.is.null,category.eq."
      );
    } else {
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

  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  const { data, error: fetchError } = await dataQuery
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (fetchError) throw fetchError;

  return {
    events: data || [],
    totalCount: count || 0,
  };
};
