import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

interface UsageStatsProps {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
}

export const UsageStats = ({ totalCredits, usedCredits, remainingCredits }: UsageStatsProps) => {
  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <BarChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalCredits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(totalCredits * 1000000).toLocaleString()} tokens available
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
            <BarChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${usedCredits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(usedCredits * 1000000).toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <BarChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">${remainingCredits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(remainingCredits * 1000000).toLocaleString()} tokens left
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
