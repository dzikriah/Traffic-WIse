'use server';

import { determineCongestionFactor } from '@/ai/flows/adjust-toll-gate-dynamically';
import { explainTrafficChange } from '@/ai/flows/explain-traffic-changes';
import { simulateTrafficFlow } from '@/ai/flows/simulate-traffic-volume-variation';
import { simulateVehicleCrossing } from '@/ai/flows/simulate-vehicle-crossing';
import type { TrafficData, TrafficStatus, SimulateVehicleCrossingOutput } from '@/lib/types';

const getTrafficStatus = (totalVolume: number): TrafficStatus => {
  if (totalVolume <= 150) return 'Smooth';
  if (totalVolume <= 300) return 'Moderate';
  return 'Heavy';
};

const initialTrafficData: TrafficData = {
  timestamp: '',
  location: 'Jl. Jenderal Sudirman, Jakarta',
  total_volume: 0,
  car_volume: 0,
  motorcycle_volume: 0,
  average_speed: 0,
  traffic_status: 'Smooth',
  congestion_factor: 'Initializing...',
  explanation: 'System is initializing. Awaiting first simulation...',
};

export async function runSimulationStep(
  previousData: TrafficData | null
): Promise<TrafficData> {
  const currentData = previousData || initialTrafficData;

  try {
    // 1. Simulate new traffic volumes and speed
    const simOutput = await simulateTrafficFlow({
      location: currentData.location,
      currentCarVolume: currentData.car_volume,
      currentMotorcycleVolume: currentData.motorcycle_volume,
      currentAverageSpeed: currentData.average_speed,
    });

    const newCarVolume = Math.max(0, simOutput.newCarVolume);
    const newMotorcycleVolume = Math.max(0, simOutput.newMotorcycleVolume);
    const newAverageSpeed = Math.max(0, simOutput.newAverageSpeed);
    const newTotalVolume = newCarVolume + newMotorcycleVolume;

    // 2. Determine new traffic status
    const newTrafficStatus = getTrafficStatus(newTotalVolume);

    // 3. Determine primary congestion factor
    const { congestionFactor } = await determineCongestionFactor({
      trafficStatus: newTrafficStatus,
      carVolume: newCarVolume,
      motorcycleVolume: newMotorcycleVolume,
      averageSpeed: newAverageSpeed,
    });

    // 4. Get a human-readable explanation of the changes
    const timestamp = new Date().toISOString();
    const { explanation } = await explainTrafficChange({
      location: currentData.location,
      previousTotalVolume: currentData.total_volume,
      currentTotalVolume: newTotalVolume,
      previousAverageSpeed: currentData.average_speed,
      currentAverageSpeed: newAverageSpeed,
      previousTrafficStatus: currentData.traffic_status,
      currentTrafficStatus: newTrafficStatus,
      timestamp: timestamp,
    });

    // 5. Return the new comprehensive traffic data
    return {
      timestamp,
      location: currentData.location,
      total_volume: newTotalVolume,
      car_volume: newCarVolume,
      motorcycle_volume: newMotorcycleVolume,
      average_speed: Math.round(newAverageSpeed),
      traffic_status: newTrafficStatus,
      congestion_factor: congestionFactor,
      explanation,
    };
  } catch (error) {
    console.error('Error during simulation step:', error);
    return {
      ...currentData,
      timestamp: new Date().toISOString(),
      explanation:
        'An error occurred while simulating traffic changes. Using last known state.',
    };
  }
}

export async function getRealtimeVehicleEvent(
  trafficStatus: TrafficStatus
): Promise<SimulateVehicleCrossingOutput> {
  try {
    const vehicleEvent = await simulateVehicleCrossing({ trafficStatus });
    return vehicleEvent;
  } catch (error) {
    console.error('Error getting real-time vehicle event:', error);
    // Return a fallback event
    return {
      timestamp: new Date().toISOString(),
      vehicleType: 'Car',
      speed: 0,
      eventDescription: 'Error fetching simulation data.',
    };
  }
}
