import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActivityMonitor } from '../hooks/useActivityMonitor';
import { SearchBar } from '../components/SearchBar';
import { FilterButton } from '../components/FilterButton';
import { SortButton } from '../components/SortButton';
import { EventListItem } from '../components/EventListItem';
import { theme } from '../styles/theme';
import type { ActivityEvent, FilterOptions, SortOption } from '../types';

export const MainScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { isRunning, events, loading, startMonitoring, stopMonitoring, refreshEvents } =
    useActivityMonitor();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ eventTypes: [] });
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.app_name.toLowerCase().includes(query) ||
          event.app_package_name.toLowerCase().includes(query)
      );
    }

    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(event => filters.eventTypes.includes(event.event_type));
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'date_asc':
        sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'date_desc':
        sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'app_name':
        sorted.sort((a, b) => a.app_name.localeCompare(b.app_name));
        break;
      case 'event_type':
        sorted.sort((a, b) => a.event_type.localeCompare(b.event_type));
        break;
    }

    return sorted;
  }, [events, searchQuery, filters, sortBy]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>Activity Tracker</Text>
        <TouchableOpacity
          style={[
            styles.statusButton,
            isRunning ? styles.statusActive : styles.statusInactive,
          ]}
          onPress={isRunning ? stopMonitoring : startMonitoring}
          activeOpacity={0.7}
        >
          <View style={[styles.statusDot, isRunning && styles.statusDotActive]} />
          <Text style={styles.statusText}>{isRunning ? 'Active' : 'Stopped'}</Text>
        </TouchableOpacity>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <View style={styles.controlsRow}>
        <FilterButton filters={filters} onFiltersChange={setFilters} />
        <SortButton sortBy={sortBy} onSortChange={setSortBy} />
        <View style={styles.spacer} />
        <Text style={[styles.eventCount, isDarkMode && styles.textSecondaryDark]}>
          {filteredAndSortedEvents.length} events
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ActivityEvent }) => <EventListItem event={item} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, isDarkMode && styles.textSecondaryDark]}>
        {searchQuery || filters.eventTypes.length > 0
          ? 'No events match your filters'
          : isRunning
          ? 'Waiting for events...'
          : 'Start monitoring to track events'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.containerDark]}
      edges={['top', 'left', 'right']}
    >
      <FlatList
        data={filteredAndSortedEvents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshEvents}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerDark: {
    backgroundColor: theme.colors.backgroundDark,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  textDark: {
    color: theme.colors.textDark,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.sm,
  },
  statusActive: {
    backgroundColor: '#16A34A',
  },
  statusInactive: {
    backgroundColor: '#6B7280',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusDotActive: {
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    ...theme.typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  eventCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  textSecondaryDark: {
    color: theme.colors.textSecondaryDark,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
