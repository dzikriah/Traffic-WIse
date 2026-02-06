import { z } from 'zod';

export type TrafficStatus = 'Smooth' | 'Moderate' | 'Heavy';

export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Thunderstorm';

export interface TrafficData {
  timestamp: string;
  location: string;
  total_volume: number;
  car_volume: number;
  motorcycle_volume: number;
  average_speed: number; // in km/h
  traffic_status: TrafficStatus;
  congestion_factor: string;
  explanation: string;
  weather: WeatherCondition;
  temperature: number;
}

export const SimulateVehicleCrossingInputSchema = z.object({
  trafficStatus: z.string().describe("The current traffic status ('Smooth', 'Moderate', or 'Heavy')."),
});
export type SimulateVehicleCrossingInput = z.infer<typeof SimulateVehicleCrossingInputSchema>;

export const SimulateVehicleCrossingOutputSchema = z.object({
  timestamp: z.string().describe('The ISO timestamp of the event.'),
  vehicleType: z.enum(['Car', 'Motorcycle', 'Bus', 'Truck']).describe('The type of vehicle.'),
  speed: z.number().describe('The speed of the vehicle in km/h.'),
});
export type SimulateVehicleCrossingOutput = z.infer<typeof SimulateVehicleCrossingOutputSchema>;


export const PredictRouteInputSchema = z.object({
    location: z.string().describe('The starting location.'),
    destination: z.string().describe('The destination location.'),
    trafficStatus: z.string().describe("The current traffic status ('Smooth', 'Moderate', or 'Heavy')."),
    weather: z.string().describe('The current weather condition (e.g., Sunny, Cloudy, Rainy).'),
    temperature: z.number().describe('The current temperature in Celsius.'),
  });
export type PredictRouteInput = z.infer<typeof PredictRouteInputSchema>;

const ModePredictionSchema = z.object({
  time: z.string().describe('Estimated travel time (e.g., "25-35 mins").'),
  insight: z.string().describe('Short specific advice for this mode.'),
  cost: z.string().describe('Rough cost estimate (e.g., "Rp 15k - 25k").'),
});

export const PredictRouteOutputSchema = z.object({
    distance: z.string().describe('The predicted distance in kilometers (e.g., "15.2 km").'),
    predictions: z.object({
      car: ModePredictionSchema,
      motorcycle: ModePredictionSchema,
      publicTransport: ModePredictionSchema,
    }),
    bestMode: z.enum(['car', 'motorcycle', 'publicTransport']).describe('The recommended transport mode based on current conditions.'),
    suggestedRoute: z.string().describe('The suggested primary route name.'),
    explanation: z.string().describe('An explanation for the overall recommendation.'),
    weatherImpact: z.string().describe('How weather specifically affects these modes.'),
    travelAdvisory: z.string().describe('Specific Jakarta context like Ganjil-Genap, construction, or flood risks.'),
    peakTimeAdvisory: z.string().describe('Insight into whether traffic is expected to improve or worsen in the next hour.'),
    comfortScore: z.number().min(1).max(10).describe('A score from 1-10 indicating trip ease.'),
});
export type PredictRouteOutput = z.infer<typeof PredictRouteOutputSchema>;
