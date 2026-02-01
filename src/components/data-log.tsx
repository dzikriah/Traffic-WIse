'use client';

import { useEffect, useState, useCallback } from 'react';
import { getRealtimeVehicleEvents } from '@/lib/actions';
import { type SimulateVehicleCrossingOutput } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Bike, Bus, Truck } from 'lucide-react';
import { type TrafficStatus } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

type DataLogProps = {
  currentTrafficStatus: TrafficStatus;
  isVisible: boolean;
};

export default function DataLog({ currentTrafficStatus, isVisible }: DataLogProps) {
  const [vehicleEvents, setVehicleEvents] = useState<SimulateVehicleCrossingOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicleEvents = useCallback(async () => {
    if(!isVisible) return;
    const newEvents = await getRealtimeVehicleEvents(currentTrafficStatus);
    setVehicleEvents(prev => [...newEvents, ...prev].slice(0, 100));
    setIsLoading(false);
  }, [currentTrafficStatus, isVisible]);

  useEffect(() => {
    if(!isVisible) {
      if(vehicleEvents.length > 0) setVehicleEvents([]);
      setIsLoading(true);
      return;
    };

    if (vehicleEvents.length === 0) {
      setIsLoading(true);
      fetchVehicleEvents();
    }

    const intervalId = setInterval(fetchVehicleEvents, 2000); 

    return () => clearInterval(intervalId);
  }, [fetchVehicleEvents, isVisible, vehicleEvents.length]);

  if (!isVisible) return null;

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Real-time Vehicle Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[60vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="w-[150px]">Time</TableHead>
              <TableHead className="w-[200px]">Vehicle Type</TableHead>
              <TableHead>Speed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && vehicleEvents.length === 0 ? (
              Array.from({ length: 15 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : (
              vehicleEvents.map((event, index) => (
                <TableRow key={`${event.timestamp}-${index}`}>
                  <TableCell className="font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {event.vehicleType === 'Car' && <Car className="h-4 w-4 text-muted-foreground" />}
                    {event.vehicleType === 'Motorcycle' && <Bike className="h-4 w-4 text-muted-foreground" />}
                    {event.vehicleType === 'Bus' && <Bus className="h-4 w-4 text-muted-foreground" />}
                    {event.vehicleType === 'Truck' && <Truck className="h-4 w-4 text-muted-foreground" />}
                    {event.vehicleType}
                  </TableCell>
                  <TableCell>{event.speed} km/h</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
