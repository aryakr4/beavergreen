export type USState = "OR" | "WA";

export type Category =
  | "waterfall"
  | "hike"
  | "viewpoint"
  | "lake"
  | "hot-spring"
  | "beach"
  | "forest"
  | "other";

export type Difficulty = "easy" | "moderate" | "hard";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PracticalInfo {
  parking?: string;
  fee?: string;
  dogFriendly?: boolean;
}

export interface Location {
  id: string;
  name: string;
  state: USState;
  category: Category;
  difficulty: Difficulty;
  lat: number;
  lng: number;
  description: string;
  bestSeason?: string[];
  practicalInfo?: PracticalInfo;
  photos: string[];
  createdAt: string;
}

export interface Review {
  id: number;
  locationId: string;
  rating: number;
  text: string;
  authorName?: string;
  createdAt: string;
}
