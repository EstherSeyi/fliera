import { EventCategory, EventVisibility, Event } from "../../types";

export interface PaginatedEventsResult {
  events: Event[];
  totalCount: number;
}

export interface EventFilters {
  title?: string;
  category?: EventCategory;
  visibility?: EventVisibility;
  dateFrom?: string;
  dateTo?: string;
}
