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
  Navigation,
  ExternalLink
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
    <Card className="h-full border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Navigation className="h-6 w-6 text-primary" />
          Smart Trip Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="destination" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Where are you going?</Label>
            <div className="flex gap-2">
              <Input
                id="destination"
                placeholder="e.g., Grand Indonesia, Soekarno-Hatta Airport..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isLoading}
                className="bg-muted/50 border-primary/10 focus-visible:ring-primary/30"
              />
              <Button onClick={handlePrediction} disabled={isLoading} className="shrink-0 font-bold px-6 shadow-md transition-all hover:scale-105">
                {isLoading ? 'Analyzing...' : 'Predict'}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-6 mt-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          )}

          {prediction && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Summary Section */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-tight mb-1">Trip Summary</h4>
                    <p className="text-sm leading-relaxed font-medium">
                      {prediction.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distance and Route */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Estimated Distance</p>
                  <p className="text-2xl font-black text-foreground">{prediction.distance}</p>
                </div>
                <div className="p-4 rounded-xl bg-card border shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Primary Corridor</p>
                  <p className="text-sm font-bold truncate" title={prediction.suggestedRoute}>{prediction.suggestedRoute}</p>
                </div>
              </div>

              {/* Multi-Modal Predictions */}
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-2 block">Travel Times by Mode</Label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Car */}
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="h-4 w-4 text-blue-500" />
                      <span className="text-[10px] font-black uppercase text-blue-600">Car</span>
                    </div>
                    <p className="text-lg font-black text-blue-700 mb-1">{prediction.predictions.car.time}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{prediction.predictions.car.insight}</p>
                  </div>

                  {/* Motorcycle */}
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Bike className="h-4 w-4 text-orange-500" />
                      <span className="text-[10px] font-black uppercase text-orange-600">Motor</span>
                    </div>
                    <p className="text-lg font-black text-orange-700 mb-1">{prediction.predictions.motorcycle.time}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{prediction.predictions.motorcycle.insight}</p>
                  </div>

                  {/* Public Transport */}
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus className="h-4 w-4 text-green-500" />
                      <span className="text-[10px] font-black uppercase text-green-600">Public</span>
                    </div>
                    <p className="text-lg font-black text-green-700 mb-1">{prediction.predictions.publicTransport.time}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{prediction.predictions.publicTransport.insight}</p>
                  </div>
                </div>
              </div>

              {/* Comfort Score */}
              <div className="space-y-2 bg-muted/20 p-4 rounded-xl border">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Smile className="h-4 w-4" />
                    Journey Comfort Score
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-black",
                    prediction.comfortScore > 7 ? "bg-green-500/20 text-green-600 border border-green-500/30" :
                    prediction.comfortScore > 4 ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" :
                    "bg-red-500/20 text-red-600 border border-red-500/30"
                  )}>
                    {prediction.comfortScore}/10
                  </span>
                </div>
                <Progress value={prediction.comfortScore * 10} className="h-2 bg-muted/50" />
              </div>

              {/* Specific Insights */}
              <div className="grid gap-4 bg-muted/10 p-4 rounded-xl border border-dashed">
                <div className="flex gap-4">
                  <CloudSun className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Weather Impact</p>
                    <p className="text-xs text-foreground font-medium">{prediction.weatherImpact}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Travel Advisory</p>
                    <p className="text-xs text-foreground font-medium">{prediction.travelAdvisory}</p>
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
