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
  weather: 'Sunny',
  temperature: 30,
};

export async function runSimulationStep(
  previousData: TrafficData | null
): Promise<TrafficData> {
  const currentData = previousData?.total_volume
    ? previousData
    : initialTrafficData;

  // 1. Simulate new traffic volumes with randomness
  const carChange = Math.floor(Math.random() * 50) - 20; // Fluctuation between -20 and +29
  const motorcycleChange = Math.floor(Math.random() * 70) - 30; // Fluctuation between -30 and +39

  let newCarVolume = currentData.car_volume + carChange;
  let newMotorcycleVolume = currentData.motorcycle_volume + motorcycleChange;

  // Ensure volumes are within a realistic range
  newCarVolume = Math.max(20, Math.min(newCarVolume, 250));
  newMotorcycleVolume = Math.max(30, Math.min(newMotorcycleVolume, 350));

  const newTotalVolume = newCarVolume + newMotorcycleVolume;

  // 2. Simulate new average speed (inversely related to volume)
  const baseSpeed = 70;
  const reductionPerVehicle = 0.08;
  let newAverageSpeed = baseSpeed - newTotalVolume * reductionPerVehicle;
  newAverageSpeed += Math.floor(Math.random() * 10) - 5; // Add some random variance
  newAverageSpeed = Math.max(5, Math.min(newAverageSpeed, 60)); // Clamp speed within 5-60 km/h

  // 3. Determine new traffic status
  const newTrafficStatus = getTrafficStatus(newTotalVolume);

  // 4. Get weather data
  let weatherData = {
    weather: currentData.weather,
    temperature: currentData.temperature,
  };
  try {
      weatherData = await getWeather({ location: currentData.location });
  } catch (error) {
      console.error('AI weather fetch failed:', error);
      // On failure, use previous data or a default as fallback
  }

  // 5. Generate AI-powered congestion analysis
  let analysis = {
    congestion_factor: 'Analysis pending...',
    explanation: 'Awaiting AI analysis of the current traffic data...',
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
      newCarVolume > newMotorcycleVolume ? 'Car Volume' : 'Motorcycle Volume';

    analysis = {
      congestion_factor: `Dominant Vehicle: ${dominantVehicle}`,
      explanation: explanation,
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback to non-AI analysis if the AI call fails
    const analysisByStatus = {
      Smooth: [
        {
          factor: 'Optimal Flow',
          explanation:
            'Traffic is flowing smoothly with minimal delays. This indicates a well-balanced traffic distribution and efficient signal timing, allowing for ideal travel conditions.',
        },
        {
          factor: 'Light Volume',
          explanation:
            'Vehicle volume is significantly low, resulting in high average speeds and no notable congestion. This period is optimal for travel, with clear roads and no interruptions.',
        },
      ],
      Moderate: [
        {
          factor: 'Increasing Density',
          explanation:
            'Vehicle volume is steadily rising, leading to increased traffic density. This is causing minor slowdowns, particularly around major intersections and commercial areas, as the system approaches its capacity.',
        },
        {
          factor: 'Intersection Queues',
          explanation:
            'Minor queues are beginning to form at traffic lights, suggesting that signal cycles are becoming saturated. While traffic is still moving, expect short but noticeable waiting times at key junctions.',
        },
        {
          factor: 'Slight Speed Reduction',
          explanation:
            'A higher number of vehicles on the road is causing a discernible decrease in average travel speed. The flow is becoming less fluid as drivers adjust to the increased proximity of other vehicles.',
        },
      ],
      Heavy: [
        {
          factor: 'Peak Hour Congestion',
          explanation:
            'Severe congestion is occurring due to a high volume of vehicles, typical of rush hour. This widespread slowdown is affecting both main roads and arteries, leading to significant and predictable travel delays.',
        },
        {
          factor: 'Gridlock Conditions',
          explanation:
            'Traffic is approaching a standstill. The current volume has oversaturated the road network, causing average speeds to drop to extremely low levels. Movement is intermittent and highly restricted.',
        },
        {
          factor: 'Volume Exceeds Capacity',
          explanation:
            "The number of vehicles has surpassed the road's designed capacity. This has resulted in a system-wide breakdown of traffic flow, characterized by widespread, slow-moving queues and exceptionally long travel times.",
        },
      ],
    };
    const possibleAnalyses = analysisByStatus[newTrafficStatus];
    const fallbackAnalysis =
      possibleAnalyses[Math.floor(Math.random() * possibleAnalyses.length)];
    analysis = {
      congestion_factor: fallbackAnalysis.factor,
      explanation: `AI analysis failed. Reverting to basic analysis: ${fallbackAnalysis.explanation}`,
    };
  }

  // 6. Return the new comprehensive traffic data
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
    const timestamp = new Date(
      now - i * (Math.random() * 500 + 100)
    ).toISOString();

    events.push({
      timestamp,
      vehicleType,
      speed,
    });
  }

  return Promise.resolve(
    events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );
}

export async function getRoutePrediction(input: PredictRouteInput): Promise<PredictRouteOutput> {
    try {
        const prediction = await predictRoute(input);
        return prediction;
    } catch (error) {
        console.error('AI route prediction failed:', error);
        // Fallback to a simple estimation if AI fails
        let time, explanation, transportSuggestion, weatherInfo;
        
        weatherInfo = `Weather is ${input.weather} at ${input.temperature}°C. This may affect travel conditions.`;

        switch (input.trafficStatus) {
            case 'Smooth': 
                time = '15-25'; 
                explanation = "With smooth traffic, your trip should be relatively quick. Main roads are the best option.";
                transportSuggestion = "A private vehicle or motorcycle will be efficient.";
                break;
            case 'Moderate': 
                time = '30-45'; 
                explanation = "Expect some slowdowns due to moderate traffic, particularly on major arteries. Plan for some extra time.";
                transportSuggestion = "Consider using a ride-hailing service to avoid parking hassles. The MRT is also a good alternative for routes it covers.";
                break;
            case 'Heavy': 
                time = '50-70';
                explanation = "Significant delays are likely due to heavy congestion. It's advisable to postpone travel or seek alternative routes if possible.";
                transportSuggestion = "Public transport like the TransJakarta busway or MRT is strongly recommended to bypass the worst of the traffic.";
                break;
            default: 
                time = '20-40';
                explanation = "Traffic impact is uncertain, but a general travel estimate is provided.";
                transportSuggestion = "Check a live map before departing to choose the best transport method.";
        }
        
        if (input.weather === 'Rainy' || input.weather === 'Thunderstorm') {
            transportSuggestion += " A car or public transport is preferable to a motorcycle in the rain."
        }

        return {
            predictedTravelTime: `${time} minutes`,
            suggestedRoute: `Main roads (e.g., Jl. Sudirman)`,
            distance: 'Not available',
            explanation: `AI prediction is currently unavailable. ${explanation}`,
            transportSuggestion: transportSuggestion,
            weatherInfo: weatherInfo,
            // alternativeRoute is optional, so it can be omitted in the fallback.
        }
    }
}
