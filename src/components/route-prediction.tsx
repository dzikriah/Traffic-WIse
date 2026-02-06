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
  Clock, 
  Route, 
  Milestone, 
  Users, 
  CloudSun, 
  GitFork, 
  AlertTriangle, 
  Smile, 
  AlertCircle
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
          <Map className="h-5 w-5 text-primary" />
          Smart Route Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="destination" className="text-muted-foreground">Where are you going?</Label>
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
            <div className="space-y-4 mt-4 animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          )}

          {prediction && !isLoading && (
            <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground leading-none mb-1">Travel Time</p>
                    <p className="text-lg font-bold">{prediction.predictedTravelTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                  <div className="p-2 rounded-full bg-accent/10">
                    <Milestone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground leading-none mb-1">Distance</p>
                    <p className="text-lg font-bold">{prediction.distance}</p>
                  </div>
                </div>
              </div>

              {/* Comfort Score */}
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <Smile className="h-4 w-4 text-muted-foreground" />
                    Trip Comfort Score
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
                <Progress value={prediction.comfortScore * 10} className="h-2" />
              </div>

              {/* Insights List */}
              <div className="space-y-3 rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Route className="h-5 w-5 mt-0.5 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold">Suggested: {prediction.suggestedRoute}</p>
                    {prediction.alternativeRoute && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        Alt: {prediction.alternativeRoute}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold">Travel Advisory</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{prediction.travelAdvisory}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CloudSun className="h-5 w-5 mt-0.5 text-sky-500" />
                  <div>
                    <p className="text-sm font-bold">Weather Impact</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{prediction.weatherInfo}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 mt-0.5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-bold">Transport Tip</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{prediction.transportSuggestion}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border-l-4 border-primary">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-foreground italic leading-relaxed">
                  {prediction.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
