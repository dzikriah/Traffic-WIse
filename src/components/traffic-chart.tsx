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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type TrafficChartProps = {
  data: { time: string; cars: number; motorcycles: number }[];
  isLoading: boolean;
};

const chartConfig = {
  cars: {
    label: 'Cars',
    color: 'hsl(var(--chart-1))',
  },
  motorcycles: {
    label: 'Motorcycles',
    color: 'hsl(var(--chart-2))',
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
          top: 10,
          right: 20,
          left: 10,
          bottom: 0,
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
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <defs>
          <linearGradient id="fillCars" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-cars)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-cars)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillMotorcycles" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-motorcycles)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-motorcycles)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="motorcycles"
          type="natural"
          fill="url(#fillMotorcycles)"
          fillOpacity={1}
          stroke="var(--color-motorcycles)"
          stackId="a"
        />
        <Area
          dataKey="cars"
          type="natural"
          fill="url(#fillCars)"
          fillOpacity={1}
          stroke="var(--color-cars)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
