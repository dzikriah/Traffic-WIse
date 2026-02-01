'use client';

import { runSimulationStep } from '@/lib/actions';
import type { TrafficData } from '@/lib/types';
import {
  CarFront,
  Clock,
  Gauge,
  Info,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import TrafficCard from '@/components/traffic-card';
import TrafficChart from '@/components/traffic-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const initialTrafficData: TrafficData = {
  timestamp: new Date().toISOString(),
  toll_gate: '2 lanes open',
  vehicle_volume: 75,
  traffic_status: 'Smooth',
  explanation: 'System is initializing. Awaiting first simulation...',
};

export default function Dashboard() {
  const [trafficData, setTrafficData] =
    useState<TrafficData>(initialTrafficData);
  const [history, setHistory] = useState<{ time: string; volume: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: TrafficData['traffic_status']) => {
    switch (status) {
      case 'Smooth':
        return 'outline';
      case 'Moderate':
        return 'secondary';
      case 'Heavy':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const getStatusColorClass = (status: TrafficData['traffic_status']) => {
     switch (status) {
      case 'Smooth':
        return 'text-green-500';
      case 'Moderate':
        return 'text-amber-500';
      case 'Heavy':
        return 'text-red-500';
      default:
        return 'text-foreground';
    }
  }

  const runStep = useCallback(
    async (currentData: TrafficData) => {
      if (!isLoading) setIsLoading(true);
      try {
        const newData = await runSimulationStep(currentData);
        setTrafficData(newData);
        const time = new Date(newData.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setHistory((prev) =>
          [...prev, { time, volume: newData.vehicle_volume }].slice(-20)
        );
      } catch (error) {
        console.error('Simulation step failed:', error);
        toast({
          variant: 'destructive',
          title: 'Simulation Error',
          description: 'Could not fetch new traffic data.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, isLoading]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrafficData((current) => {
        runStep(current);
        return current;
      });
    }, 7000);

    runStep(trafficData);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TrafficCard
          title="Vehicle Volume"
          value={trafficData.vehicle_volume}
          unit="vehicles"
          icon={<CarFront className="h-6 w-6 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <TrafficCard
          title="Traffic Status"
          icon={<Gauge className="h-6 w-6 text-muted-foreground" />}
          isLoading={isLoading}
        >
          {isLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    trafficData.traffic_status === 'Smooth' && 'bg-green-500',
                    trafficData.traffic_status === 'Moderate' && 'bg-amber-500',
                    trafficData.traffic_status === 'Heavy' && 'bg-red-500'
                  )}
                />
                <span className="text-2xl font-bold">
                  {trafficData.traffic_status}
                </span>
              </div>
          )}
        </TrafficCard>
        <TrafficCard
          title="Toll Gate Status"
          value={trafficData.toll_gate}
          icon={<Gauge className="h-6 w-6 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <TrafficCard
          title="Last Updated"
          value={new Date(trafficData.timestamp).toLocaleTimeString()}
          icon={<Clock className="h-6 w-6 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Vehicle Volume History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart data={history} isLoading={isLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !trafficData.explanation ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {trafficData.explanation}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
