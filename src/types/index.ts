export interface ImagePlaceholderZone {
  x: number;
  y: number;
  width: number;
  height: number;
  holeShape: "box" | "circle" | "triangle";
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
  textTransform?: string;
  labelText?: string;
}

export type EventVisibility = "private" | "public" | "archived";

export type EventCategory =
  | "business"
  | "technology"
  | "music"
  | "social"
  | "sports"
  | "activism"
  | "other";

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
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  labelText: string;
  required: boolean;
  // Text-specific properties
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  fontStyle?: string;
  textTransform?: string;
  // Image-specific properties
  holeShape?: "box" | "circle" | "triangle";
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

// New interface for paginated templates result
export interface PaginatedTemplatesResult {
  templates: FlierTemplate[];
  totalCount: number;
}

// Template filter types
export type TemplateFilterType = "all" | "my" | "others";

// Google Fonts API interface
export interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  files: Record<string, string>; // variant => font file URL
}

// AI Description Generator interfaces
export type DescriptionTone = 
  | "professional"
  | "casual" 
  | "exciting"
  | "informative"
  | "creative"
  | "formal"
  | "none";

export interface AIDescriptionFormData {
  title: string;
  date: string;
  tone: DescriptionTone;
  additionalNotes: string;
}

export interface AIDescriptionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onDescriptionGenerated: (description: string) => void;
  initialTitle?: string;
  initialDate?: string;
}

// Credit system interfaces
export interface UserCreditInfo {
  credits: number;
  is_premium_user: boolean;
  eventsCreated: number;
  totalDPsGenerated: number;
  freeEventsRemaining: number;
  freeDPsRemainingForCurrentEvents: number;
}

export interface CreditUsage {
  eventCreditsUsed: number;
  dpCreditsUsed: number;
  totalCreditsUsed: number;
}