import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { theme } from '../styles/theme';
import type { ActivityEvent, EventType } from '../types';

interface EventListItemProps {
  event: ActivityEvent;
}

const EVENT_ICONS: Record<EventType, string> = {
  app_open: '📱',
  app_close: '❌',
  screenshot: '📸',
  screen_recording_start: '🎥',
  screen_recording_stop: '⏹️',
  share: '📤',
};

const EVENT_COLORS: Record<EventType, string> = {
  app_open: '#16A34A',
  app_close: '#DC2626',
  screenshot: '#0066CC',
  screen_recording_start: '#EA580C',
  screen_recording_stop: '#6B7280',
  share: '#00D4AA',
};

export const EventListItem: React.FC<EventListItemProps> = ({ event }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const icon = EVENT_ICONS[event.event_type] || '📋';
  const color = EVENT_COLORS[event.event_type] || theme.colors.textSecondary;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatEventType = (type: EventType) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.appName, isDarkMode && styles.textDark]}>
          {event.app_name || event.app_package_name}
        </Text>
        <Text style={[styles.eventType, isDarkMode && styles.textSecondaryDark, { color }]}>
          {formatEventType(event.event_type)}
        </Text>
      </View>

      <Text style={[styles.timestamp, isDarkMode && styles.textSecondaryDark]}>
        {formatTimestamp(event.timestamp)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceGlass,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  containerDark: {
    backgroundColor: theme.colors.surfaceGlassDark,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  appName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  textDark: {
    color: theme.colors.textDark,
  },
  eventType: {
    ...theme.typography.bodySmall,
    fontWeight: '500',
  },
  textSecondaryDark: {
    color: theme.colors.textSecondaryDark,
  },
  timestamp: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
