import { modelRepository } from "@/data/repositories/modelRepository";
import { ModelInfo } from "@/models/types/model.types";

export class ModelService {
  async getAvailableModels(): Promise<ModelInfo[]> {
    return modelRepository.fetchAvailableModels();
  }
}

export const modelService = new ModelService();
