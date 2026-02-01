'use client';

import { useEffect, useState, useCallback } from 'react';
import { getRealtimeVehicleEvent } from '@/lib/actions';
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
import { Car, Bike } from 'lucide-react';
import { type TrafficStatus } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

type DataLogProps = {
  currentTrafficStatus: TrafficStatus;
  isVisible: boolean;
};

export default function DataLog({ currentTrafficStatus, isVisible }: DataLogProps) {
  const [vehicleEvents, setVehicleEvents] = useState<SimulateVehicleCrossingOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicleEvent = useCallback(async () => {
    if(!isVisible) return;
    const newEvent = await getRealtimeVehicleEvent(currentTrafficStatus);
    setVehicleEvents(prev => [newEvent, ...prev].slice(0, 20));
    setIsLoading(false);
  }, [currentTrafficStatus, isVisible]);

  useEffect(() => {
    if(!isVisible) {
      return;
    };

    if (vehicleEvents.length === 0) {
      setIsLoading(true);
      fetchVehicleEvent();
    }

    const intervalId = setInterval(fetchVehicleEvent, 3000); // Fetch every 3 seconds

    return () => clearInterval(intervalId);
  }, [fetchVehicleEvent, isVisible, vehicleEvents.length]);

  if (!isVisible) return null;

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Data Real-time Kendaraan di Lampu Merah</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Jenis Kendaraan</TableHead>
              <TableHead>Kecepatan</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && vehicleEvents.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                </TableRow>
              ))
            ) : (
              vehicleEvents.map((event, index) => (
                <TableRow key={`${event.timestamp}-${index}`}>
                  <TableCell>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {event.vehicleType === 'Car' ? <Car className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
                    {event.vehicleType}
                  </TableCell>
                  <TableCell>{event.speed} km/h</TableCell>
                  <TableCell>{event.eventDescription}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
