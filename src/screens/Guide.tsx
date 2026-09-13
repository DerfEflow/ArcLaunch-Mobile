import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '@/store';
import {
  addMessage,
  createConversation,
  setCurrentConversation,
  setSending,
} from '@/store/slices/guide';
import { MainAppStackParamList } from '@/navigation';
import { apiClient } from '@/api/client';

type Props = NativeStackScreenProps<MainAppStackParamList, 'Guide'>;

export default function GuideScreen({ route }: Props) {
  const { ventureId } = route.params || {};
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, currentConversationId, isSending } = useSelector(
    (state: RootState) => state.guide
  );
  const { isOnline } = useSelector((state: RootState) => state.sync);
  const [messageText, setMessageText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initialize conversation
    if (!currentConversationId) {
      const newConversation = {
        id: `conv-${Date.now()}`,
        title: 'New Conversation',
        ventureId,
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      dispatch(createConversation(newConversation));
    }
  }, []);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentConversation) {
      return;
    }

    const userMessage = {
      id: `msg-${Date.now()}`,
      conversationId: currentConversation.id,
      role: 'user' as const,
      body: messageText,
      timestamp: Date.now(),
    };

    dispatch(addMessage(userMessage));
    setMessageText('');
    dispatch(setSending(true));

    try {
      // Send to backend
      if (isOnline) {
        const response = await apiClient.post('/api/guide/message', {
          conversationId: currentConversation.id,
          message: messageText,
        });

        // Add assistant response
        const assistantMessage = {
          id: `msg-${Date.now()}-resp`,
          conversationId: currentConversation.id,
          role: 'assistant' as const,
          body: response.message || 'No response',
          sources: response.sources,
          timestamp: Date.now(),
        };

        dispatch(addMessage(assistantMessage));
      } else {
        // Offline: show placeholder
        const assistantMessage = {
          id: `msg-${Date.now()}-offline`,
          conversationId: currentConversation.id,
          role: 'assistant' as const,
          body:
            'You are offline. Your message will be sent and answered when you regain connection.',
          timestamp: Date.now(),
        };

        dispatch(addMessage(assistantMessage));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        conversationId: currentConversation.id,
        role: 'assistant' as const,
        body: 'Failed to get a response. Please try again.',
        timestamp: Date.now(),
      };

      dispatch(addMessage(errorMessage));
    } finally {
      dispatch(setSending(false));
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.role === 'user'
            ? styles.userBubble
            : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.role === 'user'
              ? styles.userText
              : styles.assistantText,
          ]}
        >
          {item.body}
        </Text>
        {item.sources && item.sources.length > 0 && (
          <Text style={styles.sourceText}>
            Sources: {item.sources.map((s: any) => s.title).join(', ')}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.container}>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Offline - Messages will sync when online</Text>
          </View>
        )}

        {currentConversation && currentConversation.messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Start a Conversation</Text>
            <Text style={styles.emptyText}>
              Ask about your venture, customers, or what to do next.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={currentConversation?.messages || []}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
            contentContainerStyle={styles.messagesList}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask the Guide..."
            value={messageText}
            onChangeText={setMessageText}
            editable={!isSending}
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isSending || !messageText.trim()) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={isSending || !messageText.trim()}
          >
            {isSending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#0066cc',
  },
  assistantBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: '#000',
  },
  sourceText: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});
