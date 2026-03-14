import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Wallet, RefreshCw, AlertTriangle, XCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserBudget } from "@/models/types/userBudget.types";

interface UserBudgetCardProps {
  budget: UserBudget | null;
  loading: boolean;
  onRefresh: () => void;
}

export const UserBudgetCard = ({ budget, loading, onRefresh }: UserBudgetCardProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!budget) return null;

  const usagePercent = budget.max_budget > 0
    ? (budget.spend / budget.max_budget) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Account Budget</h2>
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${budget.max_budget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trial + purchased credits
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${budget.spend.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all API keys
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              ${budget.budget_remaining.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to spend
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget usage</span>
          <span className="font-medium">{usagePercent.toFixed(1)}%</span>
        </div>
        <Progress value={Math.min(usagePercent, 100)} className="h-2" />
      </div>
    </div>
  );
};
