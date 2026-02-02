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
  });
export type PredictRouteInput = z.infer<typeof PredictRouteInputSchema>;

export const PredictRouteOutputSchema = z.object({
    predictedTravelTime: z.string().describe('The predicted travel time in minutes.'),
    suggestedRoute: z.string().describe('The suggested route to take.'),
    explanation: z.string().describe('An explanation for the route suggestion based on traffic.'),
});
export type PredictRouteOutput = z.infer<typeof PredictRouteOutputSchema>;
