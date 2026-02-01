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
