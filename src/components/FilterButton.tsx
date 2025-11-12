import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { theme } from '../styles/theme';
import type { EventType, FilterOptions } from '../types';

interface FilterButtonProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  app_open: 'App Open',
  app_close: 'App Close',
  screenshot: 'Screenshot',
  screen_recording_start: 'Recording Start',
  screen_recording_stop: 'Recording Stop',
  share: 'Share',
};

export const FilterButton: React.FC<FilterButtonProps> = ({ filters, onFiltersChange }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const toggleEventType = (eventType: EventType) => {
    const newTypes = tempFilters.eventTypes.includes(eventType)
      ? tempFilters.eventTypes.filter(t => t !== eventType)
      : [...tempFilters.eventTypes, eventType];

    setTempFilters({ eventTypes: newTypes });
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setModalVisible(false);
  };

  const clearFilters = () => {
    const emptyFilters = { eventTypes: [] as EventType[] };
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setModalVisible(false);
  };

  const activeCount = filters.eventTypes.length;

  return (
    <>
      <TouchableOpacity
        style={[styles.button, isDarkMode && styles.buttonDark]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, isDarkMode && styles.textDark]}>
          Filter {activeCount > 0 && `(${activeCount})`}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>
              Filter by Action Type
            </Text>

            <View style={styles.checkboxList}>
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(eventType => (
                <TouchableOpacity
                  key={eventType}
                  style={styles.checkboxItem}
                  onPress={() => toggleEventType(eventType)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      tempFilters.eventTypes.includes(eventType) && styles.checkboxChecked,
                      isDarkMode && styles.checkboxDark,
                    ]}
                  >
                    {tempFilters.eventTypes.includes(eventType) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, isDarkMode && styles.textDark]}>
                    {EVENT_TYPE_LABELS[eventType]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.applyButton]}
                onPress={applyFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.surfaceGlass,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  buttonDark: {
    backgroundColor: theme.colors.surfaceGlassDark,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  textDark: {
    color: theme.colors.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalContentDark: {
    backgroundColor: theme.colors.surfaceDark,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  checkboxList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDark: {
    borderColor: theme.colors.borderDark,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: theme.colors.surface,
  },
  clearButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
  },
  applyButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
