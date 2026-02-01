'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type TrafficChartProps = {
  data: { time: string; volume: number }[];
  isLoading: boolean;
};

const chartConfig = {
  volume: {
    label: 'Vehicles',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function TrafficChart({ data, isLoading }: TrafficChartProps) {
  if (isLoading && data.length === 0) {
    return (
      <div className="h-[250px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          domain={[0, (dataMax: number) => dataMax + 50]}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <defs>
          <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-volume)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-volume)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="volume"
          type="natural"
          fill="url(#fillVolume)"
          stroke="var(--color-volume)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
