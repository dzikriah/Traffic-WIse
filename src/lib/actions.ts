'use server';

import type {
  TrafficData,
  TrafficStatus,
  SimulateVehicleCrossingOutput,
} from '@/lib/types';

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
  const currentData = previousData?.total_volume ? previousData : initialTrafficData;

  // 1. Simulate new traffic volumes with randomness
  const carChange = Math.floor(Math.random() * 20) - 10; // Fluctuation between -10 and +9
  const motorcycleChange = Math.floor(Math.random() * 30) - 15; // Fluctuation between -15 and +14

  let newCarVolume = currentData.car_volume + carChange;
  let newMotorcycleVolume = currentData.motorcycle_volume + motorcycleChange;

  // Ensure volumes are within a realistic range
  newCarVolume = Math.max(20, Math.min(newCarVolume, 250));
  newMotorcycleVolume = Math.max(30, Math.min(newMotorcycleVolume, 350));
  
  const newTotalVolume = newCarVolume + newMotorcycleVolume;

  // 2. Simulate new average speed (inversely related to volume)
  const baseSpeed = 70;
  const reductionPerVehicle = 0.08;
  let newAverageSpeed = baseSpeed - (newTotalVolume * reductionPerVehicle);
  newAverageSpeed += Math.floor(Math.random() * 10) - 5; // Add some random variance
  newAverageSpeed = Math.max(5, Math.min(newAverageSpeed, 60)); // Clamp speed within 5-60 km/h

  // 3. Determine new traffic status
  const newTrafficStatus = getTrafficStatus(newTotalVolume);

  // 4. Generate a varied congestion analysis based on status
  const analysisByStatus = {
    Smooth: [
      { factor: 'Normal Flow', explanation: 'Traffic is moving smoothly with no significant delays.' },
      { factor: 'Light Traffic', explanation: 'Vehicle volume is low, resulting in free-flowing traffic.' },
    ],
    Moderate: [
      { factor: 'Increasing Volume', explanation: 'A growing number of vehicles is causing slight delays as the road gets busier.' },
      { factor: 'Minor Congestion', explanation: 'Some congestion is present around intersections, but traffic is still moving steadily.' },
      { factor: 'Steady Flow', explanation: 'Traffic is consistent, with vehicles moving at a reduced but steady pace.' },
    ],
    Heavy: [
      { factor: 'Heavy Congestion', explanation: 'High vehicle volume is causing significant delays and slow-moving traffic.' },
      { factor: 'Peak Hour Traffic', explanation: 'The road is experiencing typical peak hour conditions, leading to severe congestion.' },
      { factor: 'Near Standstill', explanation: 'Traffic is nearly at a standstill, with very slow movement and long waits.' },
    ]
  };
  
  const possibleAnalyses = analysisByStatus[newTrafficStatus];
  const analysis = possibleAnalyses[Math.floor(Math.random() * possibleAnalyses.length)];

  // 5. Return the new comprehensive traffic data
  return {
    timestamp: new Date().toISOString(),
    location: currentData.location,
    total_volume: newTotalVolume,
    car_volume: newCarVolume,
    motorcycle_volume: newMotorcycleVolume,
    average_speed: Math.round(newAverageSpeed),
    traffic_status: newTrafficStatus,
    congestion_factor: analysis.factor,
    explanation: analysis.explanation,
  };
}

export async function getRealtimeVehicleEvents(
  trafficStatus: TrafficStatus
): Promise<SimulateVehicleCrossingOutput[]> {
  const vehicleTypes = ['Car', 'Motorcycle', 'Bus', 'Truck'] as const;
  type VehicleType = (typeof vehicleTypes)[number];
  
  const numberOfEvents = Math.floor(Math.random() * 4) + 2; // Generate 2 to 5 events
  const events: SimulateVehicleCrossingOutput[] = [];
  const now = Date.now();

  for (let i = 0; i < numberOfEvents; i++) {
      const vehicleType: VehicleType =
        vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

      let minSpeed = 0;
      let maxSpeed = 0;

      switch (trafficStatus) {
        case 'Smooth':
          if (vehicleType === 'Car') {
            minSpeed = 30;
            maxSpeed = 50;
          } else if (vehicleType === 'Motorcycle') {
            minSpeed = 35;
            maxSpeed = 55;
          } else {
            minSpeed = 20;
            maxSpeed = 40;
          } // Bus or Truck
          break;
        case 'Moderate':
          if (vehicleType === 'Car') {
            minSpeed = 15;
            maxSpeed = 30;
          } else if (vehicleType === 'Motorcycle') {
            minSpeed = 20;
            maxSpeed = 35;
          } else {
            minSpeed = 10;
            maxSpeed = 25;
          } // Bus or Truck
          break;
        case 'Heavy':
          minSpeed = 0;
          maxSpeed = 15;
          break;
      }

      const speed =
        Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
      
      // Stagger timestamps slightly to make it look more real
      const timestamp = new Date(now - i * (Math.random() * 500 + 100)).toISOString();

      events.push({
        timestamp,
        vehicleType,
        speed,
      });
  }


  return Promise.resolve(events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
}
