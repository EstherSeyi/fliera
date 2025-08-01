import { EventCategory } from "../types";

export const FALLBACK_EVENT_CARD_IMAGE =
  "https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

export const EVENT_CATEGORY_OPTIONS: { value: EventCategory; label: string }[] =
  [
    { value: "business", label: "Business" },
    { value: "technology", label: "Technology" },
    { value: "music", label: "Music" },
    { value: "social", label: "Social" },
    { value: "sports", label: "Sports" },
    { value: "activism", label: "Activism" },
    { value: "other", label: "Other" },
  ];
