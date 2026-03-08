export interface ModelInfo {
  id: string;
  provider: string;
  max_input_tokens: number | null;
  max_output_tokens: number | null;
  input_cost_per_million: number | null;
  output_cost_per_million: number | null;
  mode: string | null;
  status: "healthy" | "unhealthy" | "unknown";
}

export interface AvailableModelsResponse {
  models: ModelInfo[];
}
