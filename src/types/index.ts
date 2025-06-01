export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  flyerUrl: string;
  placeholderZones: {
    photo: { x: number; y: number; width: number; height: number };
    text: { x: number; y: number; width: number; height: number };
  };
}