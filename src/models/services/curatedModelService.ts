import { curatedModelRepository } from "@/data/repositories/curatedModelRepository";
import { CuratedModel } from "@/models/types/curatedModel.types";

export class CuratedModelService {
  async getAllModels(): Promise<CuratedModel[]> {
    return curatedModelRepository.fetchAll();
  }

  async getEnabledModels(): Promise<CuratedModel[]> {
    return curatedModelRepository.fetchEnabled();
  }

  async toggleModel(id: string, enabled: boolean): Promise<void> {
    return curatedModelRepository.toggleEnabled(id, enabled);
  }

  async setHuggingfaceUrl(id: string, url: string | null): Promise<void> {
    return curatedModelRepository.updateHuggingfaceUrl(id, url);
  }

  async syncModels(): Promise<number> {
    return curatedModelRepository.syncFromLitellm();
  }
}

export const curatedModelService = new CuratedModelService();
