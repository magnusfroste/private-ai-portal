import { supabase } from "@/integrations/supabase/client";
import { AvailableModelsResponse } from "@/models/types/model.types";

export class ModelRepository {
  async fetchAvailableModels(): Promise<string[]> {
    const { data, error } = await supabase.functions.invoke<AvailableModelsResponse>('list-models');
    
    if (error) throw error;
    return data?.models || [];
  }
}

export const modelRepository = new ModelRepository();
