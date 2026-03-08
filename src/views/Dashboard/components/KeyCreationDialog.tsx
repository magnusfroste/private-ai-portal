import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface KeyCreationDialogProps {
  onCreateKey: (name: string, models: string[]) => Promise<boolean>;
  isCreating: boolean;
  canCreateMore: boolean;
  remainingKeys: number;
}

export const KeyCreationDialog = ({ 
  onCreateKey, 
  isCreating, 
  canCreateMore,
  remainingKeys 
}: KeyCreationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const handleCreate = async () => {
    const success = await onCreateKey(newKeyName, []);
    if (success) {
      setNewKeyName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glow" disabled={!canCreateMore}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            {canCreateMore 
              ? `Generate a new trial API key (${remainingKeys} remaining)`
              : 'Trial key limit reached. Upgrade to create more keys.'
            }
          </DialogDescription>
        </DialogHeader>

        {!canCreateMore && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've used all your trial keys. Stripe payment integration coming soon!
            </AlertDescription>
          </Alert>
        )}

        {canCreateMore && (
          <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input
              id="keyName"
              placeholder="my-api-key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Available Models</Label>
            <div className="space-y-2">
              {availableModels.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={model}
                    checked={selectedModels.includes(model)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedModels([...selectedModels, model]);
                      } else {
                        setSelectedModels(selectedModels.filter((m) => m !== model));
                      }
                    }}
                  />
                  <label
                    htmlFor={model}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {model}
                  </label>
                </div>
              ))}
            </div>
          </div>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Key"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
