import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  sessionId: string;  // Add sessionId to persist with chat
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Chats
  chats: Chat[];
  currentChat: string | null;
  messages: Record<string, Message[]>;
  
  // Actions
  createNewChat: (title?: string) => string;
  setCurrentChat: (id: string | null) => void;
  deleteChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  clearMessages: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      // Chats
      chats: [],
      currentChat: null,
      messages: {},
      
      // Actions
      createNewChat: (title = 'New Chat') => {
        const id = Date.now().toString();
        const sessionId = `${process.env.NEXT_PUBLIC_SESSION_PREFIX || 'demolition_blog_'}${id}`;
        const newChat: Chat = {
          id,
          title,
          sessionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChat: id,
          messages: { ...state.messages, [id]: [] }
        }));
        
        return id;
      },
      
      setCurrentChat: (id) => set({ currentChat: id }),
      
      deleteChat: (id) => set((state) => {
        const { [id]: _, ...remainingMessages } = state.messages;
        const remainingChats = state.chats.filter(chat => chat.id !== id);
        
        return {
          chats: remainingChats,
          messages: remainingMessages,
          currentChat: state.currentChat === id ? null : state.currentChat
        };
      }),
      
      updateChatTitle: (id, title) => set((state) => ({
        chats: state.chats.map(chat => 
          chat.id === id 
            ? { ...chat, title, updatedAt: new Date() }
            : chat
        )
      })),
      
      addMessage: (chatId, message) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message]
        },
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? { ...chat, updatedAt: new Date() }
            : chat
        )
      })),
      
      clearMessages: (chatId) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: []
        }
      })),
    }),
    {
      name: 'demolition-chat-store',
      partialize: (state) => ({
        theme: state.theme,
        chats: state.chats,
        currentChat: state.currentChat,
        messages: state.messages,
      }),
    }
  )
);