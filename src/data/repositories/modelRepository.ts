import { supabase } from "@/integrations/supabase/client";
import { AvailableModelsResponse, ModelInfo } from "@/models/types/model.types";

export class ModelRepository {
  async fetchAvailableModels(): Promise<ModelInfo[]> {
    const { data, error } = await supabase.functions.invoke<AvailableModelsResponse>('list-models');
    
    if (error) throw error;
    return data?.models || [];
  }
}

export const modelRepository = new ModelRepository();
