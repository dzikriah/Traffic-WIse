'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRoutePrediction } from '@/lib/actions';
import { type PredictRouteOutput, type WeatherCondition } from '@/lib/types';
import { Map, Clock, Route, Milestone, Users, CloudSun, GitFork } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Route Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination</Label>
            <div className="flex gap-2">
              <Input
                id="destination"
                placeholder="e.g., Grand Indonesia"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handlePrediction} disabled={isLoading}>
                {isLoading ? 'Predicting...' : 'Predict Route'}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-1/3" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
               <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-1/2" />
              </div>
               <Skeleton className="h-10 w-full" />
            </div>
          )}

          {prediction && !isLoading && (
            <div className="mt-4 space-y-4 rounded-lg border bg-muted/50 p-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{prediction.predictedTravelTime}</p>
                    <p className="text-sm text-muted-foreground">Predicted Travel Time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Milestone className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{prediction.distance}</p>
                    <p className="text-sm text-muted-foreground">Estimated Distance</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Route className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{prediction.suggestedRoute}</p>
                    <p className="text-sm text-muted-foreground">Suggested Route</p>
                </div>
              </div>
              
              {prediction.alternativeRoute && (
                <div className="flex items-start gap-3">
                  <GitFork className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                      <p className="font-semibold">{prediction.alternativeRoute}</p>
                      <p className="text-sm text-muted-foreground">Alternative Route</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <CloudSun className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{prediction.weatherInfo}</p>
                    <p className="text-sm text-muted-foreground">Weather Impact</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{prediction.transportSuggestion}</p>
                    <p className="text-sm text-muted-foreground">Transport Suggestion</p>
                </div>
              </div>
              
              <p className="text-sm text-foreground italic border-t border-border pt-3 mt-3">{prediction.explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
