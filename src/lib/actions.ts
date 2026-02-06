'use server';

import {
  explainTrafficChange,
  type ExplainTrafficChangeInput,
} from '@/ai/flows/explain-traffic-changes';
import { getWeather } from '@/ai/flows/get-weather';
import { predictRoute } from '@/ai/flows/predict-route-flow';
import type {
  TrafficData,
  TrafficStatus,
  SimulateVehicleCrossingOutput,
  WeatherCondition,
  PredictRouteInput,
  PredictRouteOutput,
} from '@/lib/types';

const getTrafficStatus = (totalVolume: number): TrafficStatus => {
  if (totalVolume <= 80) return 'Smooth';
  if (totalVolume <= 150) return 'Moderate';
  return 'Heavy';
};

const initialTrafficData: TrafficData = {
  timestamp: '',
  location: 'Jl. M.H. Thamrin, Jakarta',
  total_volume: 0,
  car_volume: 0,
  motorcycle_volume: 0,
  average_speed: 0,
  traffic_status: 'Smooth',
  congestion_factor: 'Initializing...',
  explanation: 'System is initializing. Awaiting first simulation...',
  weather: 'Cloudy',
  temperature: 27.5,
};

export async function runSimulationStep(
  previousData: TrafficData | null
): Promise<TrafficData> {
  const currentData = previousData?.total_volume
    ? previousData
    : initialTrafficData;

  const carChange = Math.floor(Math.random() * 50) - 20;
  const motorcycleChange = Math.floor(Math.random() * 70) - 30;

  let newCarVolume = currentData.car_volume + carChange;
  let newMotorcycleVolume = currentData.motorcycle_volume + motorcycleChange;

  newCarVolume = Math.max(20, Math.min(newCarVolume, 250));
  newMotorcycleVolume = Math.max(30, Math.min(newMotorcycleVolume, 350));

  const newTotalVolume = newCarVolume + newMotorcycleVolume;

  const baseSpeed = 70;
  const reductionPerVehicle = 0.08;
  let newAverageSpeed = baseSpeed - newTotalVolume * reductionPerVehicle;
  newAverageSpeed += Math.floor(Math.random() * 10) - 5;
  newAverageSpeed = Math.max(5, Math.min(newAverageSpeed, 60));

  const newTrafficStatus = getTrafficStatus(newTotalVolume);

  let weatherData = {
    weather: currentData.weather,
    temperature: currentData.temperature,
  };
  
  try {
    const aiWeather = await getWeather({ 
      location: currentData.location,
      currentWeather: currentData.weather
    });
    
    let finalTemp = aiWeather.temperature;
    // Force temperatures down for rain/storm as per requirements
    if ((aiWeather.weather === 'Rainy' || aiWeather.weather === 'Thunderstorm') && finalTemp > 26) {
        finalTemp = 23 + (Math.random() * 3);
    } else if (aiWeather.weather === 'Sunny' && finalTemp < 29) {
        finalTemp = 30 + (Math.random() * 4);
    }

    const jitter = (Math.random() * 0.4 - 0.2);
    weatherData = {
      weather: aiWeather.weather,
      temperature: Math.round((finalTemp + jitter) * 10) / 10,
    };
  } catch (error) {
    console.error('AI weather fetch failed:', error);
    const drift = (Math.random() * 0.4 - 0.2);
    let targetTemp = weatherData.temperature;
    
    if (weatherData.weather === 'Rainy' || weatherData.weather === 'Thunderstorm') {
      targetTemp = Math.min(targetTemp, 25.5);
    } else if (weatherData.weather === 'Sunny') {
      targetTemp = Math.max(targetTemp, 30.5);
    }
    weatherData.temperature = Math.round((targetTemp + drift) * 10) / 10;
  }

  let analysis = {
    congestion_factor: 'Analysis pending...',
    explanation: 'Awaiting AI analysis...',
  };

  try {
    const aiInput: ExplainTrafficChangeInput = {
      location: currentData.location,
      previousTotalVolume: currentData.total_volume,
      currentTotalVolume: newTotalVolume,
      previousAverageSpeed: currentData.average_speed,
      currentAverageSpeed: Math.round(newAverageSpeed),
      previousTrafficStatus: currentData.traffic_status,
      currentTrafficStatus: newTrafficStatus,
      timestamp: new Date().toISOString(),
      carVolume: newCarVolume,
      motorcycleVolume: newMotorcycleVolume,
      weather: weatherData.weather,
      temperature: weatherData.temperature,
    };

    const { explanation } = await explainTrafficChange(aiInput);
    const dominantVehicle =
      newCarVolume > newMotorcycleVolume ? 'Car Dominance' : 'Motorcycle Dominance';

    analysis = {
      congestion_factor: `${dominantVehicle} (${newTrafficStatus})`,
      explanation: explanation,
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    analysis = {
      congestion_factor: `System Baseline: ${newTrafficStatus}`,
      explanation: `Current flow is ${newTrafficStatus.toLowerCase()} with ${newTotalVolume} vehicles in ${weatherData.weather.toLowerCase()} conditions.`,
    };
  }

  return {
    timestamp: new Date().toISOString(),
    location: currentData.location,
    total_volume: newTotalVolume,
    car_volume: newCarVolume,
    motorcycle_volume: newMotorcycleVolume,
    average_speed: Math.round(newAverageSpeed),
    traffic_status: newTrafficStatus,
    congestion_factor: analysis.congestion_factor,
    explanation: analysis.explanation,
    weather: weatherData.weather,
    temperature: weatherData.temperature,
  };
}

export async function getRealtimeVehicleEvents(
  trafficStatus: TrafficStatus
): Promise<SimulateVehicleCrossingOutput[]> {
  const vehicleTypes = ['Car', 'Motorcycle', 'Bus', 'Truck'] as const;
  type VehicleType = (typeof vehicleTypes)[number];

  const numberOfEvents = Math.floor(Math.random() * 4) + 2;
  const events: SimulateVehicleCrossingOutput[] = [];
  const now = Date.now();

  for (let i = 0; i < numberOfEvents; i++) {
    const vehicleType: VehicleType =
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

    let minSpeed = 0;
    let maxSpeed = 0;

    switch (trafficStatus) {
      case 'Smooth': minSpeed = 30; maxSpeed = 55; break;
      case 'Moderate': minSpeed = 15; maxSpeed = 35; break;
      case 'Heavy': minSpeed = 2; maxSpeed = 15; break;
    }

    const speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
    const timestamp = new Date(now - i * (Math.random() * 500 + 100)).toISOString();

    events.push({
      timestamp,
      vehicleType,
      speed,
    });
  }

  return Promise.resolve(events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
}

export async function getRoutePrediction(input: PredictRouteInput): Promise<PredictRouteOutput> {
    try {
        const prediction = await predictRoute(input);
        return prediction;
    } catch (error) {
        console.error('AI route prediction failed:', error);
        
        const isRainy = input.weather === 'Rainy' || input.weather === 'Thunderstorm';
        const trafficFactor = input.trafficStatus === 'Heavy' ? 2.5 : input.trafficStatus === 'Moderate' ? 1.5 : 1;

        return {
            distance: '12.4 km',
            predictions: {
              car: { 
                time: `${Math.round(30 * trafficFactor)}-${Math.round(45 * trafficFactor)} mins`, 
                insight: "Check for Odd-Even (Ganjil-Genap) restrictions on main roads." 
              },
              motorcycle: { 
                time: `${Math.round(20 * trafficFactor)}-${Math.round(30 * trafficFactor)} mins`, 
                insight: isRainy ? "Heavy rain makes motorcycle travel significantly slower and riskier." : "Efficient for filtering through heavy traffic queues." 
              },
              publicTransport: { 
                time: "45-55 mins", 
                insight: "TransJakarta and MRT provide a predictable journey regardless of road congestion." 
              },
            },
            suggestedRoute: `Sudirman-Thamrin Corridor`,
            explanation: `Based on current ${input.trafficStatus.toLowerCase()} traffic and ${input.weather.toLowerCase()} conditions, public transport or motorcycle (if not raining) are your best bets for speed.`,
            weatherImpact: isRainy ? "Heavy rain will cause surface pooling and slow down all road-based transport modes." : "Clear weather is ideal for all transport modes.",
            travelAdvisory: "Stay alert for sudden weather changes and check the latest road construction updates near your destination.",
            comfortScore: input.trafficStatus === 'Heavy' ? 3 : 7,
        }
    }
}
