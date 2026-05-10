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
