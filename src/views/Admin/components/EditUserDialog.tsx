import { useState, useEffect } from "react";
import { AdminUser } from "@/models/types/admin.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, maxKeys: number) => void;
  onReset: (userId: string) => void;
  isUpdating: boolean;
}

export const EditUserDialog = ({
  user,
  open,
  onOpenChange,
  onSave,
  onReset,
  isUpdating,
}: EditUserDialogProps) => {
  const [maxKeys, setMaxKeys] = useState(3);

  useEffect(() => {
    if (user) {
      setMaxKeys(user.max_trial_keys);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    onSave(user.id, maxKeys);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset(user.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redigera användare</DialogTitle>
          <DialogDescription>
            {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nuvarande status</Label>
            <div className="text-sm text-muted-foreground">
              Trial keys skapade: <span className="font-semibold text-foreground">{user.trial_keys_created}</span> / {user.max_trial_keys}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="max-keys">Max trial keys: {maxKeys}</Label>
            <Slider
              id="max-keys"
              min={1}
              max={20}
              step={1}
              value={[maxKeys]}
              onValueChange={(value) => setMaxKeys(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Direkt ange värde</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={maxKeys}
              onChange={(e) => setMaxKeys(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {user.trial_keys_created > 0 && (
            <div className="border-t pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={isUpdating}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Nollställ trial keys ({user.trial_keys_created} → 0)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Nollställ trial keys?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Detta nollställer trial keys för {user.full_name || user.email} från {user.trial_keys_created} till 0. Användaren kan sedan skapa nya trial-nycklar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>
                      Nollställ
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Sparar..." : "Spara"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
