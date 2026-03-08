import { Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

export interface ModelBreakdown {
  model: string;
  value: number;
  color: string;
}

interface ActivityStatCardProps {
  title: string;
  value: string;
  chartData: { date: string; [model: string]: string | number }[];
  modelBreakdowns: ModelBreakdown[];
  formatValue?: (v: number) => string;
}

const MODEL_COLORS = [
  "hsl(30, 90%, 55%)",    // orange
  "hsl(145, 70%, 50%)",   // green
  "hsl(320, 70%, 60%)",   // pink
  "hsl(200, 80%, 55%)",   // blue
  "hsl(50, 85%, 55%)",    // yellow
  "hsl(270, 60%, 60%)",   // purple
];

export const getModelColor = (index: number) =>
  MODEL_COLORS[index % MODEL_COLORS.length];

export const ActivityStatCard = ({
  title,
  value,
  chartData,
  modelBreakdowns,
  formatValue,
}: ActivityStatCardProps) => {
  const models = modelBreakdowns.map((m) => m.model);

  return (
    <Card className="glass-card flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground font-medium">
            {title}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <span className="text-3xl font-bold tracking-tight mb-4">{value}</span>

        {/* Chart */}
        <div className="h-28 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%">
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240 10% 8%)",
                  border: "1px solid hsl(240 5% 20%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(0 0% 98%)",
                }}
                labelStyle={{ color: "hsl(240 5% 65%)" }}
              />
              {models.map((model, i) => (
                <Bar
                  key={model}
                  dataKey={model}
                  stackId="a"
                  radius={i === models.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                >
                  {chartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={getModelColor(i)}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model legend */}
        <div className="space-y-1.5 mt-auto">
          {modelBreakdowns.map((m) => (
            <div key={m.model} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-muted-foreground truncate">{m.model}</span>
              </div>
              <span className="font-medium tabular-nums ml-2 shrink-0">
                {formatValue ? formatValue(m.value) : m.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
