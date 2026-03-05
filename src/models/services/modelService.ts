import { modelRepository } from "@/data/repositories/modelRepository";

export class ModelService {
  async getAvailableModels(): Promise<string[]> {
    return modelRepository.fetchAvailableModels();
  }
}

export const modelService = new ModelService();
