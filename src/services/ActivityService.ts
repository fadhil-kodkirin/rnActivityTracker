import { supabase } from '../utils/supabase';
import type { ActivityEvent, NativeActivityEvent } from '../types';

export class ActivityService {
  private deviceId: string = '';
  private eventQueue: ActivityEvent[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly SYNC_INTERVAL_MS = 30000;

  async initialize(deviceId: string) {
    this.deviceId = deviceId;
    this.startAutoSync();
  }

  addEvent(nativeEvent: NativeActivityEvent) {
    const event: ActivityEvent = {
      id: this.generateTempId(),
      timestamp: new Date(nativeEvent.timestamp).toISOString(),
      event_type: nativeEvent.eventType,
      app_package_name: nativeEvent.appPackageName,
      app_name: nativeEvent.appName,
      device_id: this.deviceId,
      metadata: nativeEvent.metadata || {},
      created_at: new Date().toISOString(),
    };

    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.syncEvents();
    }
  }

  async syncEvents() {
    if (this.eventQueue.length === 0) return;

    const eventsToSync = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('activity_events')
        .insert(
          eventsToSync.map(event => ({
            timestamp: event.timestamp,
            event_type: event.event_type,
            app_package_name: event.app_package_name,
            app_name: event.app_name,
            device_id: event.device_id,
            metadata: event.metadata,
          }))
        );

      if (error) {
        console.error('Failed to sync events:', error);
        this.eventQueue.push(...eventsToSync);
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.eventQueue.push(...eventsToSync);
    }
  }

  async fetchEvents(
    limit: number = 100,
    offset: number = 0
  ): Promise<ActivityEvent[]> {
    const { data, error } = await supabase
      .from('activity_events')
      .select('*')
      .eq('device_id', this.deviceId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }

    return data || [];
  }

  private startAutoSync() {
    this.syncInterval = setInterval(() => {
      this.syncEvents();
    }, this.SYNC_INTERVAL_MS);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const activityService = new ActivityService();
