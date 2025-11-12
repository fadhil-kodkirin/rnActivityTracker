import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { usePermissions } from '../hooks/usePermissions';
import { theme } from '../styles/theme';

interface PermissionGateProps {
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ children }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {
    permissions,
    loading,
    allGranted,
    requestUsageStats,
    requestAccessibility,
    requestNotifications,
  } = usePermissions();

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>
          Checking permissions...
        </Text>
      </View>
    );
  }

  if (allGranted) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>
          Permissions Required
        </Text>
        <Text style={[styles.description, isDarkMode && styles.textSecondaryDark]}>
          This app needs the following permissions to monitor your activities:
        </Text>

        <View style={styles.permissionList}>
          <PermissionItem
            title="Usage Stats"
            description="Track which apps you open and close"
            granted={permissions.usageStats}
            onRequest={requestUsageStats}
            isDarkMode={isDarkMode}
          />
          <PermissionItem
            title="Accessibility Service"
            description="Detect screenshots, screen recording, and share events"
            granted={permissions.accessibility}
            onRequest={requestAccessibility}
            isDarkMode={isDarkMode}
          />
          <PermissionItem
            title="Notifications"
            description="Show monitoring status in notification bar"
            granted={permissions.notifications}
            onRequest={requestNotifications}
            isDarkMode={isDarkMode}
          />
        </View>
      </View>
    </View>
  );
};

interface PermissionItemProps {
  title: string;
  description: string;
  granted: boolean;
  onRequest: () => void;
  isDarkMode: boolean;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  title,
  description,
  granted,
  onRequest,
  isDarkMode,
}) => {
  return (
    <View style={styles.permissionItem}>
      <View style={styles.permissionInfo}>
        <Text style={[styles.permissionTitle, isDarkMode && styles.textDark]}>
          {title}
        </Text>
        <Text style={[styles.permissionDescription, isDarkMode && styles.textSecondaryDark]}>
          {description}
        </Text>
      </View>
      {granted ? (
        <View style={styles.grantedBadge}>
          <Text style={styles.grantedText}>✓</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={onRequest}
          activeOpacity={0.7}
        >
          <Text style={styles.requestButtonText}>Grant</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  containerDark: {
    backgroundColor: theme.colors.backgroundDark,
  },
  card: {
    backgroundColor: theme.colors.surfaceGlass,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  cardDark: {
    backgroundColor: theme.colors.surfaceGlassDark,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textDark: {
    color: theme.colors.textDark,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  textSecondaryDark: {
    color: theme.colors.textSecondaryDark,
  },
  permissionList: {
    gap: theme.spacing.md,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  permissionInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  permissionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  permissionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  grantedBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantedText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  requestButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  requestButtonText: {
    color: '#FFFFFF',
    ...theme.typography.body,
    fontWeight: '600',
  },
});
