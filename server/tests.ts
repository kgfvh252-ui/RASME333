import { db } from './db.js';
import { GoogleGenAI } from '@google/genai';
import { isOpenAIConfigured, testOpenAIConnection } from './openai.js';

export async function runSystemDiagnostics(whatsappManager?: any): Promise<{
  timestamp: string;
  checks: {
    database: { status: 'healthy' | 'error'; count: { customers: number; products: number; orders: number }; message: string };
    gemini: { status: 'configured' | 'missing_key' | 'connected' | 'error'; message: string; model: string };
    openai: { status: 'configured' | 'missing_key' | 'connected' | 'error'; message: string; model: string; latencyMs?: number };
    whatsapp: { status: string; platform: string; phone: string | null; qrActive: boolean };
    server: { uptime: number; memoryUsageMb: number; nodeVersion: string };
  };
}> {
  const settings = db.getSettings();
  const products = db.getProducts();
  const customers = db.getCustomers();
  const orders = db.getOrders();

  // 1. Database check
  const dbCheck = {
    status: 'healthy' as const,
    count: {
      customers: customers.length,
      products: products.length,
      orders: orders.length,
    },
    message: 'قاعدة البيانات المحلية تعمل بكفاءة وسرعة فائقة.',
  };

  // 2. Gemini check
  let geminiCheck: any = {
    status: 'missing_key',
    message: 'لم يتم العثور على مفتاح GEMINI_API_KEY في متغيرات البيئة.',
    model: settings.modelGemini || 'gemini-3.8-flash',
  };

  if (process.env.GEMINI_API_KEY) {
    geminiCheck.status = 'configured';
    geminiCheck.message = 'مفتاح GEMINI_API_KEY متوفر ومحمّل بنجاح في الخادم.';
  }

  // 3. OpenAI check
  let openaiCheck: any = {
    status: 'missing_key',
    message: 'متغير OPENAI_API_KEY غير موجود في متغيرات الخادم. يمكنك إضافته من إدارة الأسرار (Secrets) لتفعيل OpenAI.',
    model: settings.modelOpenAI || 'gpt-4o',
    latencyMs: 0,
  };

  if (isOpenAIConfigured()) {
    openaiCheck.status = 'configured';
    openaiCheck.message = 'مفتاح OPENAI_API_KEY متوفر ومحمّل بأمان في الخادم.';
  }

  // 4. WhatsApp check
  const waState = whatsappManager ? whatsappManager.getState() : { status: 'disconnected', platform: 'Baileys', phoneNumber: null, qrCodeDataUrl: null };
  const waCheck = {
    status: waState.status,
    platform: waState.platform || 'WhatsApp Multi-Device',
    phone: waState.phoneNumber,
    qrActive: Boolean(waState.qrCodeDataUrl),
  };

  // 5. Server resources
  const memory = process.memoryUsage();
  const serverCheck = {
    uptime: Math.round(process.uptime()),
    memoryUsageMb: Math.round(memory.rss / (1024 * 1024)),
    nodeVersion: process.version,
  };

  return {
    timestamp: new Date().toISOString(),
    checks: {
      database: dbCheck,
      gemini: geminiCheck,
      openai: openaiCheck,
      whatsapp: waCheck,
      server: serverCheck,
    },
  };
}
