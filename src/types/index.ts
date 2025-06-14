export interface ImagePlaceholderZone {
  x: number;
  y: number;
  width: number;
  height: number;
  holeShape: 'box' | 'circle' | 'triangle';
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
  labelText?: string;
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
  use_template?: boolean;
  template_id?: string;
}

export interface EditEventFormData
  extends Omit<Event, "id" | "user_id" | "created_at" | "flyer_url"> {
  flyer_file: File | null;
}

export interface GeneratedDP {
  id: string;
  user_id: string;
  event_id: string;
  generated_image_url: string;
  user_name: string;
  created_at: string;
  user_text_inputs: string[];
  event?: {
    title: string;
    date: string;
  };
}

export interface PaginatedDPsResult {
  dps: GeneratedDP[];
  totalCount: number;
}

// New interfaces for Flier Templates
export interface TemplatePlaceholder {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  required: boolean;
  // Text-specific properties
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  fontStyle?: string;
  fontWeight?: string | number;
  textTransform?: string;
  // Image-specific properties
  holeShape?: 'box' | 'circle' | 'triangle';
}

export interface FlierTemplate {
  id: string;
  user_id: string;
  title: string;
  created_by?: string;
  template_image_url: string;
  user_image_placeholders: ImagePlaceholderZone[];
  user_text_placeholders: TextPlaceholderZone[];
  template_placeholders: TemplatePlaceholder[];
  created_at: string;
}

export interface TemplateInputValues {
  [placeholderId: string]: string | File | null;
}