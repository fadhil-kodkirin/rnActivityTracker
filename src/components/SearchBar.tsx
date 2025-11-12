import React from 'react';
import { View, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { theme } from '../styles/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search apps...',
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? theme.colors.textSecondaryDark : theme.colors.textSecondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceGlass,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  containerDark: {
    backgroundColor: theme.colors.surfaceGlassDark,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    padding: theme.spacing.md,
  },
  inputDark: {
    color: theme.colors.textDark,
  },
});
