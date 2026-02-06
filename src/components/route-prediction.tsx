'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRoutePrediction } from '@/lib/actions';
import { type PredictRouteOutput, type WeatherCondition } from '@/lib/types';
import { 
  Car, 
  Bike, 
  Bus, 
  CloudSun, 
  AlertTriangle, 
  Smile, 
  Info,
  Navigation,
  Wallet,
  TrendingUp,
  Star
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

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
    <Card className="h-full border-primary/20 shadow-lg overflow-hidden flex flex-col">
      <CardHeader className="bg-primary/5 border-b shrink-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Navigation className="h-6 w-6 text-primary" />
          Smart Trip Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 overflow-auto">
        <div className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="destination" className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Where are you going?</Label>
            <div className="flex gap-2">
              <Input
                id="destination"
                placeholder="e.g., Grand Indonesia, Soekarno-Hatta..."
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
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
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
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-tight">Trip Summary</h4>
                      <Badge variant="outline" className="bg-background/50 border-primary/20 text-[10px] py-0">AI Agent</Badge>
                    </div>
                    <p className="text-sm leading-relaxed font-medium">
                      {prediction.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distance and Route */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Distance</p>
                  <p className="text-2xl font-black text-foreground">{prediction.distance}</p>
                </div>
                <div className="p-4 rounded-xl bg-card border shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Corridor</p>
                  <p className="text-sm font-bold truncate" title={prediction.suggestedRoute}>{prediction.suggestedRoute}</p>
                </div>
              </div>

              {/* Multi-Modal Predictions */}
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-2 block">Multi-Modal Comparison</Label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Car */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all flex flex-col gap-2 relative",
                    prediction.bestMode === 'car' ? "bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/20" : "bg-muted/10 border-muted-foreground/10"
                  )}>
                    {prediction.bestMode === 'car' && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-sm">
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Car className={cn("h-4 w-4", prediction.bestMode === 'car' ? "text-blue-500" : "text-muted-foreground")} />
                      <span className="text-[10px] font-black uppercase">Car</span>
                    </div>
                    <div>
                      <p className="text-lg font-black leading-tight">{prediction.predictions.car.time}</p>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        <p className="text-[9px] font-medium">{prediction.predictions.car.cost}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight italic">"{prediction.predictions.car.insight}"</p>
                  </div>

                  {/* Motorcycle */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all flex flex-col gap-2 relative",
                    prediction.bestMode === 'motorcycle' ? "bg-orange-500/10 border-orange-500/50 shadow-md ring-1 ring-orange-500/20" : "bg-muted/10 border-muted-foreground/10"
                  )}>
                    {prediction.bestMode === 'motorcycle' && (
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 shadow-sm">
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Bike className={cn("h-4 w-4", prediction.bestMode === 'motorcycle' ? "text-orange-500" : "text-muted-foreground")} />
                      <span className="text-[10px] font-black uppercase">Motor</span>
                    </div>
                    <div>
                      <p className="text-lg font-black leading-tight">{prediction.predictions.motorcycle.time}</p>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        <p className="text-[9px] font-medium">{prediction.predictions.motorcycle.cost}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight italic">"{prediction.predictions.motorcycle.insight}"</p>
                  </div>

                  {/* Public Transport */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all flex flex-col gap-2 relative",
                    prediction.bestMode === 'publicTransport' ? "bg-green-500/10 border-green-500/50 shadow-md ring-1 ring-green-500/20" : "bg-muted/10 border-muted-foreground/10"
                  )}>
                    {prediction.bestMode === 'publicTransport' && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Bus className={cn("h-4 w-4", prediction.bestMode === 'publicTransport' ? "text-green-500" : "text-muted-foreground")} />
                      <span className="text-[10px] font-black uppercase">Public</span>
                    </div>
                    <div>
                      <p className="text-lg font-black leading-tight">{prediction.predictions.publicTransport.time}</p>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        <p className="text-[9px] font-medium">{prediction.predictions.publicTransport.cost}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight italic">"{prediction.predictions.publicTransport.insight}"</p>
                  </div>
                </div>
              </div>

              {/* Comfort Score & Peak Advisory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 bg-muted/20 p-4 rounded-xl border">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Smile className="h-4 w-4" />
                      Comfort Score
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black",
                      prediction.comfortScore > 7 ? "bg-green-500/20 text-green-600 border border-green-500/30" :
                      prediction.comfortScore > 4 ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" :
                      "bg-red-500/20 text-red-600 border border-red-500/30"
                    )}>
                      {prediction.comfortScore}/10
                    </span>
                  </div>
                  <Progress value={prediction.comfortScore * 10} className="h-2 bg-muted/50" />
                </div>

                <div className="bg-muted/20 p-4 rounded-xl border flex gap-3 items-start">
                  <TrendingUp className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-0.5">Peak Advisory</p>
                    <p className="text-[11px] font-medium leading-tight">{prediction.peakTimeAdvisory}</p>
                  </div>
                </div>
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
