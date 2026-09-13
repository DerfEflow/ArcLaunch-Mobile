import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GuideMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  body: string;
  sources?: Array<{ title: string; href?: string }>;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  ventureId?: string;
  updatedAt: string;
  messages: GuideMessage[];
}

export interface GuideState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: GuideState = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  isSending: false,
  error: null,
};

export const guideSlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    createConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
      state.currentConversationId = action.payload.id;
    },
    addMessage: (state, action: PayloadAction<GuideMessage>) => {
      const conversation = state.conversations.find(
        (c) => c.id === state.currentConversationId
      );
      if (conversation) {
        conversation.messages.push(action.payload);
        conversation.updatedAt = new Date().toISOString();
      }
    },
    updateMessageBody: (
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; body: string }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        const message = conversation.messages.find((m) => m.id === action.payload.messageId);
        if (message) {
          message.body = action.payload.body;
        }
      }
    },
  },
});

export const {
  setLoading,
  setSending,
  setError,
  setConversations,
  setCurrentConversation,
  createConversation,
  addMessage,
  updateMessageBody,
} = guideSlice.actions;
export default guideSlice.reducer;
