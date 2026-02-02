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

export default function TrafficMap({ trafficStatus, location }: TrafficMapProps) {
  const mapImage = PlaceHolderImages.find((img) => img.id === 'jakarta-map');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Traffic Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          {mapImage ? (
            <Image
              src={mapImage.imageUrl}
              alt={mapImage.description}
              fill
              className="object-cover"
              data-ai-hint={mapImage.imageHint}
            />
          ) : (
            <div className="w-full h-full bg-muted animate-pulse" />
          )}
          <div
            className={cn(
              'absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-colors duration-500',
              'top-[45%] left-[55%]',
              {
                'bg-green-500': trafficStatus === 'Smooth',
                'bg-amber-500': trafficStatus === 'Moderate',
                'bg-red-500 animate-pulse-deep': trafficStatus === 'Heavy',
              }
            )}
            title={`Traffic at ${location} is ${trafficStatus}`}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}
