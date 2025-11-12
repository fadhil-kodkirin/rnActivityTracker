import { useState, useEffect, useCallback } from 'react';
import { activityTrackerModule } from '../utils/nativeModule';
import type { PermissionStatus } from '../types';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    usageStats: false,
    accessibility: false,
    notifications: false,
  });
  const [loading, setLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    try {
      const status = await activityTrackerModule.checkPermissions();
      setPermissions(status);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestUsageStats = useCallback(async () => {
    try {
      await activityTrackerModule.requestUsageStatsPermission();
      setTimeout(checkPermissions, 1000);
    } catch (error) {
      console.error('Failed to request usage stats permission:', error);
    }
  }, [checkPermissions]);

  const requestAccessibility = useCallback(async () => {
    try {
      await activityTrackerModule.requestAccessibilityPermission();
      setTimeout(checkPermissions, 1000);
    } catch (error) {
      console.error('Failed to request accessibility permission:', error);
    }
  }, [checkPermissions]);

  const requestNotifications = useCallback(async () => {
    try {
      await activityTrackerModule.requestNotificationPermission();
      setTimeout(checkPermissions, 1000);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }, [checkPermissions]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const allGranted = permissions.usageStats && permissions.accessibility && permissions.notifications;

  return {
    permissions,
    loading,
    allGranted,
    checkPermissions,
    requestUsageStats,
    requestAccessibility,
    requestNotifications,
  };
};
