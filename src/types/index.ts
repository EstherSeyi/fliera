export interface ImagePlaceholderZone {
  x: number;
  y: number;
  width: number;
  height: number;
  holeShape: 'box' | 'circle' | 'triangle' | 'trapezium';
}

export interface TextPlaceholderZone {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  textAlign: CanvasTextAlign;
  fontFamily: string;
  fontStyle: string;
  textTransform: string;
  fontWeight: string | number;
}

export type EventVisibility = 'private' | 'public' | 'archived';

export type EventCategory = 
  | 'business'
  | 'technology'
  | 'music'
  | 'social'
  | 'sports'
  | 'activism'
  | 'other';

export interface Event {
  id: string;
  user_id?: string;
  title: string;
  date: string;
  description: string | null;
  flyer_url: string;
  image_placeholders: ImagePlaceholderZone[];
  text_placeholders: TextPlaceholderZone[];
  created_at?: string;
  visibility: EventVisibility;
  category: EventCategory;
}

export interface CreateEventFormData
  extends Omit<Event, "id" | "user_id" | "created_at" | "flyer_url"> {
  flyer_file: File | null;
}