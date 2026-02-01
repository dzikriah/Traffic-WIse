'use client';

import { runSimulationStep } from '@/lib/actions';
import type { TrafficData } from '@/lib/types';
import {
  Bike,
  Car,
  Clock,
  Gauge,
  LineChart as LineChartIcon,
  MapPin,
  TrafficCone,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import TrafficCard from '@/components/traffic-card';
import TrafficChart from '@/components/traffic-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const initialTrafficData: TrafficData = {
  timestamp: new Date().toISOString(),
  location: 'Jl. Jenderal Sudirman, Jakarta',
  total_volume: 120,
  car_volume: 70,
  motorcycle_volume: 50,
  average_speed: 45,
  traffic_status: 'Smooth',
  congestion_factor: 'Normal Flow',
  explanation: 'System is initializing. Awaiting first simulation...',
};

export default function Dashboard() {
  const [trafficData, setTrafficData] =
    useState<TrafficData>(initialTrafficData);
  const [history, setHistory] = useState<{ time: string; volume: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
          [...prev, { time, volume: newData.total_volume }].slice(-20)
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
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-6 w-6 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">
          {trafficData.location}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TrafficCard
          title="Total Vehicles"
          value={trafficData.total_volume}
          icon={<Car className="h-6 w-6 text-muted-foreground" />}
          isLoading={isLoading}
        >
          {isLoading ? (
             <Skeleton className="h-8 w-1/2" />
          ) : (
            <div>
              <div className="text-2xl font-bold">
                {trafficData.total_volume}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1"><Car className="h-4 w-4" /> {trafficData.car_volume}</span>
                  <span className="flex items-center gap-1"><Bike className="h-4 w-4" /> {trafficData.motorcycle_volume}</span>
              </div>
            </div>
          )}
        </TrafficCard>
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
          title="Average Speed"
          value={trafficData.average_speed}
          unit="km/h"
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
              <TrafficCone className="h-5 w-5" />
              Congestion Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !trafficData.explanation ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
             <div>
                <p className="text-sm font-medium text-foreground">{trafficData.congestion_factor}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {trafficData.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
