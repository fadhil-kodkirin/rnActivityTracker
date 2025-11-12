import { NativeModules, NativeEventEmitter } from 'react-native';
import type { ActivityTrackerModule } from '../types/native';

const { ActivityTrackerModule: NativeModule } = NativeModules;

if (!NativeModule) {
  throw new Error('ActivityTrackerModule is not available');
}

export const activityTrackerModule = NativeModule as ActivityTrackerModule;
export const activityEventEmitter = new NativeEventEmitter(NativeModule);
