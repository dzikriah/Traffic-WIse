import { z } from 'zod';

export type TrafficStatus = 'Smooth' | 'Moderate' | 'Heavy';

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
