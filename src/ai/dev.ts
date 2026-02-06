'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/explain-traffic-changes.ts';
import '@/ai/flows/adjust-toll-gate-dynamically.ts';
import '@/ai/flows/simulate-traffic-volume-variation.ts';
import '@/ai/flows/get-weather.ts';
import '@/ai/flows/simulate-vehicle-crossing.ts';
import '@/ai/flows/predict-route-flow.ts';
import '@/ai/flows/traffic-chat-flow.ts';
