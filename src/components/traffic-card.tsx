import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type TrafficCardProps = {
  title: string;
  value?: string | number;
  unit?: string;
  icon: ReactNode;
  isLoading: boolean;
  children?: ReactNode;
};

export default function TrafficCard({
  title,
  value,
  unit,
  icon,
  isLoading,
  children,
}: TrafficCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {children ? (
          children
        ) : isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-2xl font-bold">
            {value}
            {unit && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
