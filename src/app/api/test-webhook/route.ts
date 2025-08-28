import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  const response = {
    webhookUrl: webhookUrl || 'NOT SET',
    sessionPrefix: process.env.NEXT_PUBLIC_SESSION_PREFIX || 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  };
  
  // Try to ping the webhook with a test request
  if (webhookUrl) {
    try {
      const testResponse = await axios.post(
        webhookUrl,
        {
          chatInput: 'Test connection from Next.js app',
          sessionId: `test_${Date.now()}`
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return NextResponse.json({
        ...response,
        webhookTest: 'SUCCESS',
        webhookResponse: testResponse.data
      });
    } catch (error: any) {
      return NextResponse.json({
        ...response,
        webhookTest: 'FAILED',
        error: error.message,
        details: axios.isAxiosError(error) ? {
          status: error.response?.status,
          data: error.response?.data,
          code: error.code
        } : error
      });
    }
  }
  
  return NextResponse.json(response);
}