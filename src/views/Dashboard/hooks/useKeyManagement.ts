import { useState } from "react";
import { apiKeyService } from "@/models/services/apiKeyService";
import { TrialLimitExceededError } from "@/models/types/apiKey.types";
import { toast } from "sonner";

export const useKeyManagement = () => {
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  const createKey = async (name: string, models: string[]) => {
    if (!name.trim()) {
      toast.error("Please enter a key name");
      return false;
    }

    setIsCreatingKey(true);
    try {
      await apiKeyService.createKey({
        keyName: name,
        models: models.length > 0 ? models : undefined,
      });
      
      toast.success("API key created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating API key:", error);
      if (error instanceof TrialLimitExceededError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create API key");
      }
      return false;
    } finally {
      setIsCreatingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  return {
    createKey,
    isCreatingKey,
    copyToClipboard,
  };
};
