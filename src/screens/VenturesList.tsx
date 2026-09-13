import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '@/store';
import { setVenturesList, setLoading, setError } from '@/store/slices/ventures';
import { MainAppStackParamList } from '@/navigation';
import { apiClient } from '@/api/client';

type Props = NativeStackScreenProps<MainAppStackParamList, 'Ventures'>;

export default function VenturesListScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, isLoading } = useSelector((state: RootState) => state.ventures);
  const { isOnline } = useSelector((state: RootState) => state.sync);

  useEffect(() => {
    fetchVentures();
  }, []);

  const fetchVentures = async () => {
    dispatch(setLoading(true));
    try {
      const response = await apiClient.get('/api/ventures');
      dispatch(setVenturesList(response.ventures || []));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load ventures';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const renderVentureItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.ventureCard}
      onPress={() =>
        navigation.navigate('VentureDetail', {
          id: item.id,
        })
      }
    >
      <Text style={styles.ventureTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.ventureDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.ventureFooter}>
        <Text style={styles.ventureStatus}>{item.status || 'In Progress'}</Text>
        <Text style={styles.ventureDate}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Changes will sync when online</Text>
        </View>
      )}

      {list.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Ventures Yet</Text>
          <Text style={styles.emptyText}>
            Create or join a venture to get started with your launch path.
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          renderItem={renderVentureItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchVentures} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineBanner: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
  },
  offlineText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
  },
  ventureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ventureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  ventureDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  ventureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ventureStatus: {
    fontSize: 12,
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: '500',
  },
  ventureDate: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
