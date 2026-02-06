'use client';

import { runSimulationStep } from '@/lib/actions';
import type { TrafficData, WeatherCondition } from '@/lib/types';
import {
  Bike,
  Car,
  Clock,
  Gauge,
  LineChart as LineChartIcon,
  MapPin,
  TrafficCone,
  Sun,
  Cloudy,
  CloudRain,
  Zap,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import TrafficCard from '@/components/traffic-card';
import TrafficChart from '@/components/traffic-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DataLog from './data-log';
import TrafficMap from './traffic-map';
import RoutePrediction from './route-prediction';
import TrafficChatbot from './traffic-chatbot';

const initialTrafficData: TrafficData = {
  timestamp: '',
  location: 'Jl. M.H. Thamrin, Jakarta',
  total_volume: 0,
  car_volume: 0,
  motorcycle_volume: 0,
  average_speed: 0,
  traffic_status: 'Smooth',
  congestion_factor: 'Initializing...',
  explanation: 'System is initializing. Awaiting first simulation...',
  weather: 'Cloudy',
  temperature: 25,
};

const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
  Sunny: <Sun className="h-6 w-6 text-muted-foreground" />,
  Cloudy: <Cloudy className="h-6 w-6 text-muted-foreground" />,
  Rainy: <CloudRain className="h-6 w-6 text-muted-foreground" />,
  Thunderstorm: <Zap className="h-6 w-6 text-muted-foreground" />,
};

export default function Dashboard() {
  const [trafficData, setTrafficData] =
    useState<TrafficData>(initialTrafficData);
  const [history, setHistory] = useState<{ time: string; cars: number; motorcycles: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);
  const [locationInput, setLocationInput] = useState(initialTrafficData.location);
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

  const runStep = useCallback(async (forcedLocation?: string) => {
    const forDashboard = activeTabRef.current === 'dashboard' || activeTabRef.current === 'map';
    if (forDashboard && !isLoadingRef.current) {
      setIsLoading(true);
    } else if (!forDashboard) {
      setIsLoading(false);
    }

    try {
      const baseData = forcedLocation 
        ? { ...trafficDataRef.current, location: forcedLocation } 
        : trafficDataRef.current;
      
      const newData = await runSimulationStep(baseData);
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
    const intervalId = setInterval(runStep, 15000);

    return () => clearInterval(intervalId);
  }, [runStep]);

  const handleLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    
    toast({
      title: "Updating Location",
      description: `Switching monitor to ${locationInput}...`,
    });
    
    runStep(locationInput);
  };

  return (
    <div className="relative w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <form onSubmit={handleLocationUpdate} className="flex items-center gap-2 w-full md:w-auto bg-muted/30 p-1 rounded-lg border">
            <MapPin className="h-5 w-5 text-muted-foreground ml-2" />
            <Input 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Search road name..."
              className="border-none bg-transparent focus-visible:ring-0 h-9 w-full md:w-64 text-sm font-medium"
            />
            <Button type="submit" size="sm" variant="ghost" className="h-8">
              <Search className="h-4 w-4 mr-2" />
              Update
            </Button>
          </form>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="route-prediction">Route Prediction</TabsTrigger>
            <TabsTrigger value="data-log">Data</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-0 space-y-4 md:space-y-8">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
              title="Weather"
              icon={weatherIcons[trafficData.weather] || <Cloudy className="h-6 w-6 text-muted-foreground" />}
              isLoading={isLoading}
            >
              {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div>
                  <div className="text-2xl font-bold">
                    {trafficData.temperature}°C
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{trafficData.weather}</p>
                </div>
              )}
            </TrafficCard>
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
          <div className="grid grid-cols-1 gap-4 md:gap-8">
            <div className="space-y-4 md:space-y-8">
              <Card>
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
          </div>
        </TabsContent>
        <TabsContent value="route-prediction" className="mt-0">
          <RoutePrediction 
            location={trafficData.location} 
            trafficStatus={trafficData.traffic_status}
            weather={trafficData.weather}
            temperature={trafficData.temperature}
          />
        </TabsContent>
        <TabsContent value="data-log" className="mt-0">
          <DataLog currentTrafficStatus={trafficData.traffic_status} isVisible={activeTab === 'data-log'} />
        </TabsContent>
        <TabsContent value="map" className="mt-0">
          <TrafficMap trafficStatus={trafficData.traffic_status} location={trafficData.location} />
        </TabsContent>
      </Tabs>
      <TrafficChatbot trafficContext={trafficData} />
    </div>
  );
}
