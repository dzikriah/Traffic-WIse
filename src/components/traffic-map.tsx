'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { TrafficStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type TrafficMapProps = {
  trafficStatus: TrafficStatus;
  location: string;
};

interface MapPoint {
  id: string;
  name: string;
  top: string;
  left: string;
  // We can vary the status slightly for visual interest or keep them synced
  offset?: number; 
}

const MONITORING_POINTS: MapPoint[] = [
  { id: '1', name: 'Monas Area', top: '35%', left: '50%' },
  { id: '2', name: 'Thamrin-Sudirman', top: '45%', left: '55%' },
  { id: '3', name: 'Kuningan Intersection', top: '55%', left: '62%' },
  { id: '4', name: 'Semanggi Interchange', top: '52%', left: '52%' },
  { id: '5', name: 'Gatot Subroto Corridor', top: '58%', left: '48%' },
  { id: '6', name: 'Tomang Interchange', top: '40%', left: '35%' },
  { id: '7', name: 'Cawang Intersection', top: '65%', left: '75%' },
  { id: '8', name: 'Blok M Area', top: '75%', left: '45%' },
];

export default function TrafficMap({ trafficStatus, location }: TrafficMapProps) {
  const mapImage = PlaceHolderImages.find((img) => img.id === 'jakarta-map');

  return (
    <Card className="h-full border-primary/10 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Jakarta Live Monitoring
          </CardTitle>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Smooth
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Heavy
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted border shadow-inner">
          {mapImage ? (
            <Image
              src={mapImage.imageUrl}
              alt={mapImage.description}
              fill
              className="object-cover opacity-80"
              data-ai-hint={mapImage.imageHint}
            />
          ) : (
            <div className="w-full h-full bg-muted animate-pulse" />
          )}
          
          {/* Monitoring Points Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {MONITORING_POINTS.map((point) => (
              <div
                key={point.id}
                className={cn(
                  'absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-xl transition-all duration-700 ease-in-out',
                  {
                    'bg-green-500 scale-100': trafficStatus === 'Smooth',
                    'bg-amber-500 scale-110': trafficStatus === 'Moderate',
                    'bg-red-500 scale-125 animate-pulse-deep': trafficStatus === 'Heavy',
                  }
                )}
                style={{ top: point.top, left: point.left }}
                title={`${point.name}: ${trafficStatus}`}
              >
                <div className={cn(
                  "absolute inset-0 rounded-full opacity-30",
                  trafficStatus === 'Smooth' && "bg-green-400 animate-ping",
                  trafficStatus === 'Moderate' && "bg-amber-400 animate-ping",
                  trafficStatus === 'Heavy' && "bg-red-400 animate-ping"
                )} />
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-2 rounded-lg border border-primary/10 text-[10px] font-semibold text-center shadow-lg animate-in fade-in slide-in-from-bottom-2">
            Currently monitoring <span className="text-primary">{location}</span> and surrounding arterial corridors.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
