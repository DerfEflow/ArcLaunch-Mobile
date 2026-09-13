import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '@/store';
import { setCurrentVenture, setLoading } from '@/store/slices/ventures';
import { MainAppStackParamList } from '@/navigation';
import { apiClient } from '@/api/client';

type Props = NativeStackScreenProps<MainAppStackParamList, 'VentureDetail'>;

export default function VentureDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { current, isLoading } = useSelector((state: RootState) => state.ventures);

  useEffect(() => {
    fetchVentureDetail();
    navigation.setOptions({ title: current?.title || 'Venture' });
  }, []);

  const fetchVentureDetail = async () => {
    dispatch(setLoading(true));
    try {
      const response = await apiClient.get(`/api/ventures/${id}`);
      dispatch(setCurrentVenture(response.venture));
    } catch (error) {
      console.error('Failed to load venture:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Venture not found</Text>
      </View>
    );
  }

  const stages = current.path_json?.stages || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{current.title}</Text>
        {current.description && (
          <Text style={styles.description}>{current.description}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Launch Path</Text>
        {stages.length === 0 ? (
          <Text style={styles.emptyText}>No stages yet</Text>
        ) : (
          stages.map((stage: any, index: number) => (
            <TouchableOpacity
              key={stage.id}
              style={[
                styles.stageCard,
                stage.completed && styles.stageCompleted,
              ]}
              onPress={() =>
                navigation.navigate('PathStage', {
                  ventureId: id,
                  stageId: stage.id,
                })
              }
            >
              <View style={styles.stageNumber}>
                <Text style={styles.stageNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stageContent}>
                <Text style={styles.stageName}>{stage.name}</Text>
                <Text style={styles.stageStatus}>
                  {stage.completed ? '✓ Completed' : 'Not Started'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('Guide', { ventureId: id })
          }
        >
          <Text style={styles.actionButtonText}>Chat with AI Guide</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    margin: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  stageCompleted: {
    borderLeftColor: '#4caf50',
    backgroundColor: '#f0f7f0',
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageNumberText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  stageContent: {
    flex: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  stageStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
