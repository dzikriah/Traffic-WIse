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
  Navigation,
  Wallet,
  TrendingUp,
  Star,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight
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
    <Card className="h-full border-primary/20 shadow-xl overflow-hidden flex flex-col bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 border-b shrink-0 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5 text-primary" />
            AI Trip Intelligence
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 animate-pulse">
            Live Analysis
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1 overflow-auto">
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 p-4 rounded-xl bg-muted/30 border border-dashed">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="destination" className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Set Destination</Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="destination"
                placeholder="e.g., Monas, Pondok Indah Mall..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handlePrediction()}
                className="bg-background border-primary/10 focus-visible:ring-primary/30 shadow-inner"
              />
              <Button onClick={handlePrediction} disabled={isLoading} className="shrink-0 font-bold px-6 shadow-lg transition-all active:scale-95 bg-primary hover:bg-primary/90">
                {isLoading ? 'Thinking...' : 'Analyze'}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-6 mt-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            </div>
          )}

          {prediction && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4">
              
              {/* Executive Summary Section */}
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 relative overflow-hidden group hover:bg-primary/10 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Trip Insight Summary</h4>
                      <Badge variant="outline" className="text-[9px] h-4 border-primary/30">{prediction.distance}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed font-semibold text-foreground/90">
                      {prediction.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Congestion & Route Focus */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col gap-1">
                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Primary Congestion</span>
                    <p className="text-xs font-bold truncate">{prediction.primaryCongestionPoint}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col gap-1">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Suggested Corridor</span>
                    <p className="text-xs font-bold truncate">{prediction.suggestedRoute}</p>
                </div>
              </div>

              {/* Multi-Modal Comparison */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Comparative Analysis</Label>
                  <span className="text-[10px] text-muted-foreground font-bold">Estimated duration for {prediction.distance}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Car */}
                  <div className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col gap-2 relative group",
                    prediction.bestMode === 'car' ? "bg-blue-500/5 border-blue-500/40 shadow-xl ring-1 ring-blue-500/20" : "bg-muted/10 border-muted-foreground/10"
                  )}>
                    {prediction.bestMode === 'car' && (
                      <div className="absolute -top-2.5 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-xl animate-bounce duration-1000">
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", prediction.bestMode === 'car' ? "bg-blue-500/20" : "bg-muted/30")}>
                        <Car className={cn("h-4 w-4", prediction.bestMode === 'car' ? "text-blue-500" : "text-muted-foreground")} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tight">Car</span>
                    </div>
                    <div>
                      <p className="text-lg font-black leading-none">{prediction.predictions.car.time}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                        <Wallet className="h-2.5 w-2.5" />
                        <p className="text-[8px] font-bold">{prediction.predictions.car.cost}</p>
                      </div>
                    </div>
                  </div>

                  {/* Motorcycle */}
                  <div className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col gap-2 relative group",
                    prediction.bestMode === 'motorcycle' ? "bg-orange-500/5 border-orange-500/40 shadow-xl ring-1 ring-orange-500/20" : "bg-muted/10 border-muted-foreground/10"
                  )}>
                    {prediction.bestMode === 'motorcycle' && (
                      <div className="absolute -top-2.5 -right-2 bg-orange-500 text-white rounded-full p-1.5 shadow-xl animate-bounce duration-1000">
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", prediction.bestMode === 'motorcycle' ? "bg-orange-500/20" : "bg-muted/30")}>
                        <Bike className={cn("h-4 w-4", prediction.bestMode === 'motorcycle' ? "text-orange-500" : "text-muted-foreground")} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tight">Motor</span>
                    </div>
                    <div>
                      <p className="text-lg font-black leading-none">{prediction.predictions.motorcycle.time}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                        <Wallet className="h-2.5 w-2.5" />
                        <p className="text-[8px] font-bold">{prediction.predictions.motorcycle.cost}</p>
                      </div>
                    </div>
                  </div>

                  {/* Public Transport */}
                  <div className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col gap-2 relative group",
                    prediction.bestMode === 'publicTransport' ? "bg-green-500/5 border-green-500/40 shadow-xl ring-1 ring-green-500/20" : "bg-muted/10 border-muted-foreground/10"
                  )}>
                    {prediction.bestMode === 'publicTransport' && (
                      <div className="absolute -top-2.5 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-xl animate-bounce duration-1000">
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", prediction.bestMode === 'publicTransport' ? "bg-green-500/20" : "bg-muted/30")}>
                        <Bus className={cn("h-4 w-4", prediction.bestMode === 'publicTransport' ? "text-green-500" : "text-muted-foreground")} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tight">Public</span>
                    </div>
                    <div>
                      <p className="text-lg font-black leading-none">{prediction.predictions.publicTransport.time}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                        <Wallet className="h-2.5 w-2.5" />
                        <p className="text-[8px] font-bold">{prediction.predictions.publicTransport.cost}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Peak & Comfort Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-card border shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Smile className="h-3.5 w-3.5" />
                      Trip Comfort
                    </span>
                    <span className="font-black text-foreground">{prediction.comfortScore}/10</span>
                  </div>
                  <Progress value={prediction.comfortScore * 10} className="h-1.5 bg-muted" />
                </div>

                <div className="p-4 rounded-2xl bg-card border shadow-sm flex gap-3 items-start">
                  <TrendingUp className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Peak Trends</p>
                    <p className="text-[10px] font-bold leading-tight line-clamp-2">{prediction.peakTimeAdvisory}</p>
                  </div>
                </div>
              </div>

              {/* Contextual Warnings */}
              <div className="grid gap-3 bg-muted/5 p-4 rounded-2xl border border-dashed">
                <div className="flex gap-3">
                  <CloudSun className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Weather Impact</p>
                    <p className="text-[11px] text-foreground font-semibold leading-relaxed">{prediction.weatherImpact}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-muted">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Local Advisory</p>
                    <p className="text-[11px] text-foreground font-semibold leading-relaxed">{prediction.travelAdvisory}</p>
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
