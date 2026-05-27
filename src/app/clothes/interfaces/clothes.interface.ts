export interface ClothingItem {
  id: string;
  user_id: string;
  image_url: string;
  garment_type: string;
  name?: string;
  source?: string;
  status?: string;
  classification_id?: string;
  category?: string;
  subcategory?: string;
  color?: string;
  pattern?: string;
  material?: string;
  season?: string;
  occasion?: string;
  confidence?: number;
  model_name?: string;
  model_version?: string;
  processing_error?: string;
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClothingDTO {
  image_url: string;
  garment_type: string;
  name?: string;
  source?: string;
  status?: string;
}

export interface UpdateStatusDTO {
  status: string;
}

export interface UpdateClassificationDTO {
  classification_id?: string;
  name?: string;
  category?: string;
  subcategory?: string;
  color?: string;
  pattern?: string;
  material?: string;
  season?: string;
  occasion?: string;
  confidence?: number;
  source?: string;
  model_name?: string;
  model_version?: string;
  status?: string;
  processing_error?: string;
  processed_at?: string;
}

/** Client-side shape for building multipart upload (not sent as JSON) */
export interface UploadClothingPayload {
  image: File;
  garment_type: string;
  name: string;
}

/** Reasoning breakdown returned inside each OutfitRecommendation */
export interface OutfitReasoning {
  color_harmony: string;
  season_match: string;
  occasion_match: string;
  pattern_note: string;
  material_note?: string;
  preference_note?: string;
}

/** Single outfit recommendation from GET /wei/clothes/recommendations */
export interface OutfitRecommendation {
  id: string;
  name: string;
  top: ClothingItem;
  bottom: ClothingItem;
  footwear: ClothingItem;
  score: number;
  reasoning: OutfitReasoning;
  description: string;
}

/** Query params for GET /wei/clothes/recommendations */
export interface RecommendationParams {
  user_id: string;
  season?: string;
  occasion?: string;
  limit?: number;
}

/** User style preferences from GET/PUT /wei/clothes/preferences */
export interface UserStylePreferences {
  user_id: string;
  preferred_colors: string[];
  preferred_occasions: string[];
  preferred_seasons: string[];
  avoid_colors: string[];
}
