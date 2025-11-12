import { useState, useEffect, useCallback } from 'react';
import { activityTrackerModule, activityEventEmitter } from '../utils/nativeModule';
import { activityService } from '../services/ActivityService';
import type { ActivityEvent, NativeActivityEvent } from '../types';

export const useActivityMonitor = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const checkServiceStatus = useCallback(async () => {
    try {
      const running = await activityTrackerModule.isServiceRunning();
      setIsRunning(running);
    } catch (error) {
      console.error('Failed to check service status:', error);
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    try {
      await activityTrackerModule.startMonitoring();
      setIsRunning(true);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  }, []);

  const stopMonitoring = useCallback(async () => {
    try {
      await activityTrackerModule.stopMonitoring();
      setIsRunning(false);
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedEvents = await activityService.fetchEvents(100);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeService = async () => {
      try {
        const deviceId = await activityTrackerModule.getDeviceId();
        await activityService.initialize(deviceId);
        await checkServiceStatus();
        await loadEvents();
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    initializeService();
  }, [checkServiceStatus, loadEvents]);

  useEffect(() => {
    const subscription = activityEventEmitter.addListener(
      'ActivityEvent',
      (event: NativeActivityEvent) => {
        activityService.addEvent(event);

        const newEvent: ActivityEvent = {
          id: `temp_${Date.now()}`,
          timestamp: new Date(event.timestamp).toISOString(),
          event_type: event.eventType,
          app_package_name: event.appPackageName,
          app_name: event.appName,
          device_id: '',
          metadata: event.metadata || {},
          created_at: new Date().toISOString(),
        };

        setEvents(prev => [newEvent, ...prev]);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    isRunning,
    events,
    loading,
    startMonitoring,
    stopMonitoring,
    refreshEvents: loadEvents,
  };
};
