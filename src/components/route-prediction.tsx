'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRoutePrediction } from '@/lib/actions';
import { type PredictRouteOutput, type WeatherCondition } from '@/lib/types';
import { 
  Map, 
  Car, 
  Bike, 
  Bus, 
  CloudSun, 
  AlertTriangle, 
  Smile, 
  Info,
  Navigation
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

type RoutePredictionProps = {
  location: string;
  trafficStatus: 'Smooth' | 'Moderate' | 'Heavy';
  weather: WeatherCondition;
  temperature: number;
};

export default function RoutePrediction({ location, trafficStatus, weather, temperature }: RoutePredictionProps) {
  const [destination, setDestination] = useState('');
  const [prediction, setPrediction] = useState<PredictRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePrediction = async () => {
    if (!destination) {
      toast({
        variant: 'destructive',
        title: 'Destination Required',
        description: 'Please enter a destination to get a prediction.',
      });
      return;
    }
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await getRoutePrediction({
        location,
        destination,
        trafficStatus,
        weather,
        temperature
      });
      setPrediction(result);
    } catch (error) {
      console.error('Route prediction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Prediction Error',
        description: 'Could not fetch route prediction.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Smart Multi-Modal Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="destination" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Trip Destination</Label>
            <div className="flex gap-2">
              <Input
                id="destination"
                placeholder="e.g., Grand Indonesia, Senayan City..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isLoading}
                className="bg-muted/50"
              />
              <Button onClick={handlePrediction} disabled={isLoading} className="shrink-0">
                {isLoading ? 'Analyzing...' : 'Predict'}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          )}

          {prediction && !isLoading && (
            <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Distance and Route */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Distance</p>
                  <p className="font-bold">{prediction.distance}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Suggested Road</p>
                  <p className="font-bold">{prediction.suggestedRoute}</p>
                </div>
              </div>

              {/* Multi-Modal Predictions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Car */}
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase">Mobil</span>
                  </div>
                  <p className="text-lg font-bold">{prediction.predictions.car.time}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight italic">{prediction.predictions.car.insight}</p>
                </div>

                {/* Motorcycle */}
                <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold uppercase">Motor</span>
                  </div>
                  <p className="text-lg font-bold">{prediction.predictions.motorcycle.time}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight italic">{prediction.predictions.motorcycle.insight}</p>
                </div>

                {/* Public Transport */}
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-bold uppercase">Public</span>
                  </div>
                  <p className="text-lg font-bold">{prediction.predictions.publicTransport.time}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight italic">{prediction.predictions.publicTransport.insight}</p>
                </div>
              </div>

              {/* Comfort Score */}
              <div className="space-y-2 bg-muted/30 p-4 rounded-xl">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <Smile className="h-4 w-4 text-muted-foreground" />
                    Journey Comfort Score
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold",
                    prediction.comfortScore > 7 ? "bg-green-500/20 text-green-600" :
                    prediction.comfortScore > 4 ? "bg-amber-500/20 text-amber-600" :
                    "bg-red-500/20 text-red-600"
                  )}>
                    {prediction.comfortScore}/10
                  </span>
                </div>
                <Progress value={prediction.comfortScore * 10} className="h-1.5" />
              </div>

              {/* Detailed Insights */}
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <CloudSun className="h-5 w-5 text-sky-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Weather Impact</p>
                    <p className="text-sm">{prediction.weatherImpact}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Travel Advisory</p>
                    <p className="text-sm">{prediction.travelAdvisory}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Summary</p>
                    <p className="text-sm italic text-muted-foreground">{prediction.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
