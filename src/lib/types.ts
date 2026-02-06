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

export const PredictRouteOutputSchema = z.object({
    predictedTravelTime: z.string().describe('The predicted travel time in minutes (e.g., "25-35 minutes").'),
    suggestedRoute: z.string().describe('The suggested primary route to take.'),
    distance: z.string().describe('The predicted distance in kilometers (e.g., "15.2 km").'),
    explanation: z.string().describe('An explanation for the route suggestion based on traffic.'),
    transportSuggestion: z.string().describe('A suggestion for the best mode of transport (e.g., "Private car recommended", "Consider using the MRT to avoid rain and traffic.").'),
    weatherInfo: z.string().describe('A brief note on how the current weather might impact the journey.'),
    alternativeRoute: z.string().optional().describe('An optional alternative route.'),
    travelAdvisory: z.string().describe('Specific Jakarta context like Ganjil-Genap rules, construction zones, or flood risks.'),
    comfortScore: z.number().min(1).max(10).describe('A score from 1-10 indicating the comfort/ease of the trip.'),
});
export type PredictRouteOutput = z.infer<typeof PredictRouteOutputSchema>;
