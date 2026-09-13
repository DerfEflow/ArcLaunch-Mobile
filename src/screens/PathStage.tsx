import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '@/store';
import { confirmPathStep } from '@/store/slices/ventures';
import { MainAppStackParamList } from '@/navigation';
import { apiClient } from '@/api/client';

type Props = NativeStackScreenProps<MainAppStackParamList, 'PathStage'>;

export default function PathStageScreen({ route, navigation }: Props) {
  const { ventureId, stageId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { current } = useSelector((state: RootState) => state.ventures);
  const { isOnline } = useSelector((state: RootState) => state.sync);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');

  const stage = current?.path_json?.stages?.find((s: any) => s.id === stageId);

  useEffect(() => {
    navigation.setOptions({ title: stage?.name || 'Stage' });
    if (stage?.answer) {
      setAnswer(stage.answer);
    }
  }, [stage]);

  const handleConfirm = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setIsSubmitting(true);
    try {
      // Try to sync to backend
      if (isOnline) {
        await apiClient.post(`/api/ventures/${ventureId}/stages/${stageId}/confirm`, {
          answer,
        });
      }

      // Update local state
      dispatch(confirmPathStep({ stepId: stageId, answer }));
      navigation.goBack();
    } catch (error) {
      console.error('Failed to confirm stage:', error);
      if (!isOnline) {
        // Offline: just update local state, will sync later
        dispatch(confirmPathStep({ stepId: stageId, answer }));
        navigation.goBack();
      } else {
        alert('Failed to save stage confirmation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Stage not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{stage.name}</Text>
        {stage.description && (
          <Text style={styles.description}>{stage.description}</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{stage.prompt || 'Your answer'}</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="Enter your response..."
          value={answer}
          onChangeText={setAnswer}
          editable={!isSubmitting}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm & Continue</Text>
          )}
        </TouchableOpacity>

        {!isOnline && (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineNoticeText}>
              You're offline. Changes will be saved locally and synced when online.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: 'white',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  offlineNotice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  offlineNoticeText: {
    fontSize: 12,
    color: '#856404',
  },
});
