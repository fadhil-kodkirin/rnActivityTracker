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
import type { SortOption } from '../types';

interface SortButtonProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Date (Newest First)' },
  { value: 'date_asc', label: 'Date (Oldest First)' },
  { value: 'app_name', label: 'App Name (A-Z)' },
  { value: 'event_type', label: 'Action Type' },
];

export const SortButton: React.FC<SortButtonProps> = ({ sortBy, onSortChange }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (option: SortOption) => {
    onSortChange(option);
    setModalVisible(false);
  };

  const selectedLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || '';

  return (
    <>
      <TouchableOpacity
        style={[styles.button, isDarkMode && styles.buttonDark]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, isDarkMode && styles.textDark]}>Sort</Text>
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
              Sort By
            </Text>

            <View style={styles.optionList}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionItem}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isDarkMode && styles.textDark,
                      sortBy === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
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
  optionList: {
    gap: theme.spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectedIndicator: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
});
