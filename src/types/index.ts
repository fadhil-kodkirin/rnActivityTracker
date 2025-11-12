export type EventType =
  | 'app_open'
  | 'app_close'
  | 'screenshot'
  | 'screen_recording_start'
  | 'screen_recording_stop'
  | 'share';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  event_type: EventType;
  app_package_name: string;
  app_name: string;
  device_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AppMetadata {
  id: string;
  package_name: string;
  app_name: string;
  icon_url?: string;
  first_seen: string;
  last_seen: string;
  event_count: number;
}

export interface FilterOptions {
  eventTypes: EventType[];
}

export type SortOption = 'date_desc' | 'date_asc' | 'app_name' | 'event_type';

export interface PermissionStatus {
  usageStats: boolean;
  accessibility: boolean;
  notifications: boolean;
}

export interface MonitoringStatus {
  isRunning: boolean;
  lastSync?: string;
}
