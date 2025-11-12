import type { EventType } from './index';

export interface NativeActivityEvent {
  timestamp: number;
  eventType: EventType;
  appPackageName: string;
  appName: string;
  metadata?: Record<string, any>;
}

export interface ActivityTrackerModule {
  startMonitoring(): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  checkPermissions(): Promise<{
    usageStats: boolean;
    accessibility: boolean;
    notifications: boolean;
  }>;
  requestUsageStatsPermission(): Promise<boolean>;
  requestAccessibilityPermission(): Promise<boolean>;
  requestNotificationPermission(): Promise<boolean>;
  isServiceRunning(): Promise<boolean>;
  getDeviceId(): Promise<string>;
}
