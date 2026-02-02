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
import { useCallback, useEffect, useState, useRef } from 'react';
import TrafficCard from '@/components/traffic-card';
import TrafficChart from '@/components/traffic-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataLog from './data-log';
import TrafficMap from './traffic-map';

const initialTrafficData: TrafficData = {
  timestamp: '',
  location: 'Jl. Jenderal Sudirman, Jakarta',
  total_volume: 0,
  car_volume: 0,
  motorcycle_volume: 0,
  average_speed: 0,
  traffic_status: 'Smooth',
  congestion_factor: 'Initializing...',
  explanation: 'System is initializing. Awaiting first simulation...',
};

export default function Dashboard() {
  const [trafficData, setTrafficData] =
    useState<TrafficData>(initialTrafficData);
  const [history, setHistory] = useState<{ time: string; cars: number; motorcycles: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const trafficDataRef = useRef(trafficData);
  trafficDataRef.current = trafficData;

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const runStep = useCallback(async () => {
    const forDashboard = activeTabRef.current === 'dashboard' || activeTabRef.current === 'map';
    if (forDashboard && !isLoadingRef.current) {
      setIsLoading(true);
    } else if (!forDashboard) {
      setIsLoading(false);
    }

    try {
      const newData = await runSimulationStep(trafficDataRef.current);
      setTrafficData(newData);
      const time = new Date(newData.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setHistory((prev) =>
        [...prev, { time, cars: newData.car_volume, motorcycles: newData.motorcycle_volume }].slice(-20)
      );
    } catch (error) {
      console.error('Simulation step failed:', error);
      toast({
        variant: 'destructive',
        title: 'Simulation Error',
        description: 'Could not fetch new traffic data.',
      });
    } finally {
      if (forDashboard) {
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    runStep(); // Initial run
    const intervalId = setInterval(runStep, 7000);

    return () => clearInterval(intervalId);
  }, [runStep]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            {trafficData.location}
          </h2>
        </div>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="data-log">Data</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard" className="mt-0 space-y-4 md:space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TrafficCard
            title="Total Vehicles"
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
            value={
              !isClient || isLoading || !trafficData.timestamp
                ? '...'
                : new Date(trafficData.timestamp).toLocaleTimeString()
            }
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
      </TabsContent>
      <TabsContent value="data-log" className="mt-0">
        <DataLog currentTrafficStatus={trafficData.traffic_status} isVisible={activeTab === 'data-log'} />
      </TabsContent>
      <TabsContent value="map" className="mt-0">
        <TrafficMap trafficStatus={trafficData.traffic_status} location={trafficData.location} />
      </TabsContent>
    </Tabs>
  );
}
