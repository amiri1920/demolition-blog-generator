'use client';

import { ChatInterface } from '@/components/ChatInterface/MainChat';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function Home() {
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  );
}