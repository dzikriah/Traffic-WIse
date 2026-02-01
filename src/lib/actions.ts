'use server';

import { adjustTollGateDynamically } from '@/ai/flows/adjust-toll-gate-dynamically';
import { explainTrafficChange } from '@/ai/flows/explain-traffic-changes';
import { simulateTrafficVolumeVariation } from '@/ai/flows/simulate-traffic-volume-variation';
import type { TrafficData, TrafficStatus } from '@/lib/types';

const getTrafficStatus = (volume: number): TrafficStatus => {
  if (volume <= 80) return 'Smooth';
  if (volume <= 150) return 'Moderate';
  return 'Heavy';
};

const initialTrafficData: TrafficData = {
  timestamp: new Date().toISOString(),
  toll_gate: '2 lanes open',
  vehicle_volume: 75,
  traffic_status: 'Smooth',
  explanation: 'System initialized. Traffic is flowing smoothly.',
};

export async function runSimulationStep(
  previousData: TrafficData | null
): Promise<TrafficData> {
  const currentData = previousData || initialTrafficData;

  try {
    const { newVehicleVolume } = await simulateTrafficVolumeVariation({
      currentVehicleVolume: currentData.vehicle_volume,
    });

    const newTrafficStatus = getTrafficStatus(newVehicleVolume);

    const { newTollGate } = await adjustTollGateDynamically({
      currentTrafficStatus: newTrafficStatus,
      currentTollGate: currentData.toll_gate,
      vehicleVolume: newVehicleVolume,
    });

    const timestamp = new Date().toISOString();

    const { explanation } = await explainTrafficChange({
      previousVehicleVolume: currentData.vehicle_volume,
      currentVehicleVolume: newVehicleVolume,
      previousTrafficStatus: currentData.traffic_status,
      currentTrafficStatus: newTrafficStatus,
      tollGate: newTollGate,
      timestamp: timestamp,
    });

    return {
      timestamp,
      toll_gate: newTollGate,
      vehicle_volume: newVehicleVolume,
      traffic_status: newTrafficStatus,
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
