import { supabase } from "../lib/supabase";
import type { EventFilters, PaginatedEventsResult } from "./types";

export const fetchPublicEvents = async ({
  page = 1,
  limit = 12,
  filters = {},
}: {
  page?: number;
  limit?: number;
  filters?: EventFilters;
}): Promise<PaginatedEventsResult> => {
  const offset = (page - 1) * limit;
  const today = new Date().toISOString().split("T")[0];

  let countQuery = supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("visibility", "public")
    .gte("date", today);

  let dataQuery = supabase
    .from("events")
    .select("*")
    .eq("visibility", "public")
    .gte("date", today);

  if (filters?.title) {
    const titleFilter = `%${filters.title}%`;
    countQuery = countQuery.ilike("title", titleFilter);
    dataQuery = dataQuery.ilike("title", titleFilter);
  }

  if (filters?.category) {
    if (filters?.category === "other") {
      countQuery = countQuery.or(
        "category.eq.other,category.is.null,category.eq."
      );
      dataQuery = dataQuery.or(
        "category.eq.other,category.is.null,category.eq."
      );
    } else {
      countQuery = countQuery.eq("category", filters?.category);
      dataQuery = dataQuery.eq("category", filters?.category);
    }
  }

  if (filters?.dateFrom) {
    countQuery = countQuery.gte("date", filters.dateFrom);
    dataQuery = dataQuery.gte("date", filters.dateFrom);
  }

  if (filters?.dateTo) {
    countQuery = countQuery.lte("date", filters.dateTo);
    dataQuery = dataQuery.lte("date", filters.dateTo);
  }

  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  const { data, error: dataError } = await dataQuery
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dataError) throw dataError;

  return {
    events: data || [],
    totalCount: count || 0,
  };
};
