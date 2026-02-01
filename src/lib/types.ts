export type TrafficStatus = 'Smooth' | 'Moderate' | 'Heavy';

export interface TrafficData {
  timestamp: string;
  toll_gate: string;
  vehicle_volume: number;
  traffic_status: TrafficStatus;
  explanation: string;
}
