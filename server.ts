import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { whatsappManager } from './server/whatsapp.js';
import { processCustomerMessageWithGemini } from './server/gemini.js';
import {
  isOpenAIConfigured,
  testOpenAIConnection,
  processCustomerMessageWithOpenAI,
} from './server/openai.js';
import { runSystemDiagnostics } from './server/tests.js';
import { verifyAdminCredentials } from './server/auth.js';
import { Customer, ChatMessage } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// WebSocket clients tracking
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send current state on connection
  ws.send(JSON.stringify({ event: 'whatsapp_status', data: whatsappManager.getState() }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(event: string, data: any) {
  const payload = JSON.stringify({ event, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (e) {
        console.error('WebSocket send error:', e);
      }
    }
  }
}

whatsappManager.setBroadcast(broadcast);

// --- REST API ENDPOINTS ---

// 1. Auth routes
app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = req.cookies['nexo_session'];
  if (token === 'authorized' || !process.env.REQUIRE_LOGIN) {
    return res.json({ user: db.getAdmin() });
  }
  return res.status(401).json({ error: 'Unauthenticated' });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (verifyAdminCredentials(password)) {
    res.cookie('nexo_session', 'authorized', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000,
    });
    db.addAuditLog('LOGIN_SUCCESS', 'تسجيل دخول ناجح للوحة الإدارة', 'admin');
    return res.json({ success: true, user: db.getAdmin() });
  }
  db.addAuditLog('LOGIN_FAILED', 'محاولة فاشلة لتسجيل الدخول بكلمة مرور خاطئة', 'anonymous');
  return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('nexo_session');
  return res.json({ success: true });
});

// 2. WhatsApp controls
app.get('/api/whatsapp/status', (req: Request, res: Response) => {
  res.json(whatsappManager.getState());
});

app.post('/api/whatsapp/connect', async (req: Request, res: Response) => {
  try {
    const forceFresh = Boolean(req.body.forceFresh);
    await whatsappManager.startConnection(forceFresh);
    res.json({ success: true, message: 'بدء جلسة الاتصال بـ Baileys' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/disconnect', async (req: Request, res: Response) => {
  try {
    await whatsappManager.disconnect();
    res.json({ success: true, message: 'تم قطع الاتصال بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  const { phone, text } = req.body;
  if (!phone || !text) {
    return res.status(400).json({ error: 'Phone and text are required' });
  }
  const sent = await whatsappManager.sendMessage(phone, text);
  return res.json({ success: sent });
});

// 3. Customers
app.get('/api/customers', (req: Request, res: Response) => {
  res.json(db.getCustomers());
});

app.get('/api/customers/:id', (req: Request, res: Response) => {
  const customer = db.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.put('/api/customers/:id', (req: Request, res: Response) => {
  const existing = db.getCustomerById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });
  const updated: Customer = { ...existing, ...req.body };
  db.saveCustomer(updated);
  broadcast('customer_updated', updated);
  res.json(updated);
});

app.put('/api/customers/:id/memory', (req: Request, res: Response) => {
  db.updateCustomerMemory(req.params.id, req.body);
  const updated = db.getCustomerById(req.params.id);
  broadcast('customer_updated', updated);
  res.json(updated);
});

app.post('/api/customers/:id/read', (req: Request, res: Response) => {
  db.markCustomerMessagesRead(req.params.id);
  res.json({ success: true });
});

// 4. Messages
app.get('/api/customers/:id/messages', (req: Request, res: Response) => {
  res.json(db.getMessages(req.params.id));
});

app.post('/api/customers/:id/messages', async (req: Request, res: Response) => {
  const { text, sender = 'agent' } = req.body;
  const customer = db.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const msg: ChatMessage = {
    id: `msg-${Date.now()}`,
    customerId: customer.id,
    sender,
    text,
    timestamp: new Date().toISOString(),
    status: 'sent',
  };

  db.addMessage(customer.id, msg);
  broadcast('chat_message', { customerId: customer.id, message: msg });

  // If live WhatsApp is connected and sender is agent, send via WhatsApp
  if (sender === 'agent' && whatsappManager.getState().status === 'connected') {
    whatsappManager.sendMessage(customer.phoneNumber, text).catch(console.error);
  }

  res.json(msg);
});

// 5. Products catalog
app.get('/api/products', (req: Request, res: Response) => {
  res.json(db.getProducts());
});

app.post('/api/products', (req: Request, res: Response) => {
  const product = req.body;
  if (!product.id) {
    product.id = `prod-${Date.now()}`;
  }
  db.saveProduct(product);
  broadcast('products_updated', db.getProducts());
  db.addAuditLog('PRODUCT_SAVED', `تحديث أو إضافة المنتج: ${product.name}`, 'admin');
  res.json(product);
});

// 6. Orders
app.get('/api/orders', (req: Request, res: Response) => {
  res.json(db.getOrders());
});

app.post('/api/orders', (req: Request, res: Response) => {
  const order = req.body;
  if (!order.id) {
    order.id = `ord-${Date.now()}`;
    order.orderNumber = `NX-${Math.floor(10000 + Math.random() * 90000)}`;
    order.createdAt = new Date().toISOString();
  }
  db.saveOrder(order);
  broadcast('order_created', order);
  db.addAuditLog('ORDER_CREATED', `إنشاء طلب جديد رقم ${order.orderNumber} بقيمة ${order.totalAmount} ${order.currency}`, 'admin');
  res.json(order);
});

// 7. Playbook
app.get('/api/playbook', (req: Request, res: Response) => {
  res.json(db.getPlaybook());
});

app.post('/api/playbook', (req: Request, res: Response) => {
  const rule = req.body;
  if (!rule.id) rule.id = `rule-${Date.now()}`;
  db.savePlaybookRule(rule);
  broadcast('playbook_updated', db.getPlaybook());
  res.json(rule);
});

// 8. Follow-ups
app.get('/api/follow-ups', (req: Request, res: Response) => {
  res.json(db.getFollowUps());
});

app.post('/api/follow-ups', (req: Request, res: Response) => {
  const task = req.body;
  if (!task.id) task.id = `tsk-${Date.now()}`;
  db.saveFollowUp(task);
  res.json(task);
});

// 9. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  const current = db.getSettings();
  res.json({
    ...current,
    openaiConfigured: isOpenAIConfigured(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  db.addAuditLog('SETTINGS_UPDATED', `تحديث إعدادات الذكاء الاصطناعي (المزود: ${updated.provider})`, 'admin');
  broadcast('settings_updated', updated);
  res.json({
    ...updated,
    openaiConfigured: isOpenAIConfigured(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 10. Audit logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// 11. Diagnostics
app.get('/api/diagnostics', async (req: Request, res: Response) => {
  try {
    const report = await runSystemDiagnostics(whatsappManager);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. OpenAI Connection Test Endpoint
app.post('/api/ai/test-openai', async (req: Request, res: Response) => {
  try {
    const model = req.body.model || db.getSettings().modelOpenAI || 'gpt-4o';
    const result = await testOpenAIConnection(model);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'فشل الاتصال بـ OpenAI',
    });
  }
});

// 13. Simulator: Sandbox conversation test (Gemini or OpenAI)
app.post('/api/ai/simulate', async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      messageText,
      provider = 'gemini',
      model,
      imageBase64,
      imageMimeType,
      adReferral,
      customMemory,
    } = req.body;

    let customer = customerId ? db.getCustomerById(customerId) : null;
    if (!customer) {
      customer = {
        id: 'cust-sim-01',
        phoneNumber: '972500000000',
        name: 'عميل تجريبي في المحاكي',
        tags: ['تجريبي'],
        notes: 'محادثة اختبارية داخل المحاكي',
        stage: 'lead',
        language: 'ar',
        unreadCount: 0,
        lastMessageAt: new Date().toISOString(),
        totalSpent: 0,
        ordersCount: 0,
        memory: customMemory || {
          interests: [],
          objections: [],
          budget: null,
          preferredLanguage: 'ar',
          notes: '',
          keyFacts: [],
        },
      };
    } else if (customMemory) {
      customer.memory = { ...customer.memory, ...customMemory };
    }

    const startTime = Date.now();
    let result: any;

    if (provider === 'openai') {
      result = await processCustomerMessageWithOpenAI({
        customer,
        incomingText: messageText,
        imageBase64,
        imageMimeType,
        adReferral,
      });
    } else {
      result = await processCustomerMessageWithGemini({
        customer,
        incomingText: messageText,
        imageBase64,
        imageMimeType,
        adReferral,
      });
    }

    const latencyMs = result.latencyMs || Date.now() - startTime;

    res.json({
      replyText: result.replyText,
      modelUsed: result.modelUsed,
      tokensEstimate: result.tokensEstimate,
      latencyMs,
      provider,
      memoryUpdates: result.memoryUpdates,
    });
  } catch (err: any) {
    console.error('Simulation error:', err);
    res.status(500).json({
      error: err.message || 'حدث خطأ أثناء المحاكاة',
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 NEXO AI Sales CRM Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Baileys initialized.`);
  console.log(`✨ Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing Key'}`);
  console.log(`🧠 OpenAI AI: ${isOpenAIConfigured() ? 'Configured' : 'Ready (Awaiting Key in Secrets)'}\n`);
});
