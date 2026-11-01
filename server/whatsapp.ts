import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import pino from 'pino';
import { db } from './db.js';
import { processCustomerMessageWithGemini } from './gemini.js';
import { processCustomerMessageWithOpenAI } from './openai.js';
import { WhatsAppSessionState, ChatMessage, Order, Customer } from '../src/types/index.js';

let makeWASocket: any = null;
let DisconnectReason: any = null;
let useMultiFileAuthState: any = null;

try {
  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default || baileys.makeWASocket;
  DisconnectReason = baileys.DisconnectReason;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
} catch (e) {
  console.warn('Baileys package dynamic import notice:', e);
}

const AUTH_DIR = path.resolve(process.cwd(), 'data/baileys_auth_info');
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

export class WhatsAppManager {
  private socket: any = null;
  private state: WhatsAppSessionState = {
    status: 'disconnected',
    qrCodeDataUrl: null,
    phoneNumber: null,
    pushName: null,
    platform: 'WhatsApp Business Web Multi-Device (Baileys)',
    lastConnectedAt: null,
    errorMessage: null,
    isLiveBaileys: true,
    reconnectAttempts: 0,
  };

  private broadcastCallback: ((event: string, data: any) => void) | null = null;
  private processedMessageIds = new Set<string>();
  private conversationLocks = new Map<string, boolean>();
  private reconnectTimeout: any = null;
  private isExplicitLogout = false;

  constructor() {
    // If credentials already exist from a previous session, attempt restore safely
    if (fs.existsSync(path.join(AUTH_DIR, 'creds.json'))) {
      this.state.status = 'connecting';
      setTimeout(() => this.startConnection(false), 1000);
    }
  }

  public setBroadcast(cb: (event: string, data: any) => void) {
    this.broadcastCallback = cb;
  }

  private broadcast(event: string, data: any) {
    if (this.broadcastCallback) {
      try {
        this.broadcastCallback(event, data);
      } catch (e) {
        console.error('Error broadcasting event:', e);
      }
    }
  }

  public getState(): WhatsAppSessionState {
    return { ...this.state };
  }

  public async startConnection(forceFresh = false): Promise<void> {
    if (forceFresh) {
      this.clearAuthStorage();
    }

    // Clean up existing socket cleanly before reconnecting
    if (this.socket) {
      try {
        this.socket.ev.removeAllListeners('connection.update');
        this.socket.ev.removeAllListeners('creds.update');
        this.socket.ev.removeAllListeners('messages.upsert');
        this.socket.end();
      } catch (_) {}
      this.socket = null;
    }

    if (!makeWASocket || !useMultiFileAuthState) {
      this.state.status = 'error';
      this.state.errorMessage = 'مكتبة Baileys غير متوفرة في بيئة التشغيل';
      this.broadcast('whatsapp_status', this.state);
      return;
    }

    this.isExplicitLogout = false;
    this.state.status = 'connecting';
    this.state.errorMessage = null;
    this.state.qrCodeDataUrl = null;
    this.broadcast('whatsapp_status', this.state);
    db.addAuditLog('WHATSAPP_CONNECT_REQUESTED', 'بدء جلسة Baileys وطلب رمز QR', 'admin');

    try {
      const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const logger = pino({ level: 'silent' });

      this.socket = makeWASocket({
        auth: authState,
        printQRInTerminal: false,
        logger,
        syncFullHistory: false,
        connectTimeoutMs: 30000,
        keepAliveIntervalMs: 25000,
        emitOwnEvents: false,
      });

      this.state.isLiveBaileys = true;

      // Listen for creds updates
      this.socket.ev.on('creds.update', saveCreds);

      // Listen for connection updates
      this.socket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            console.log('Baileys QR code received! Encoding data URL...');
            const qrDataUrl = await QRCode.toDataURL(qr, {
              margin: 2,
              width: 320,
              color: {
                dark: '#030712',
                light: '#ffffff',
              },
            });
            this.state.status = 'qr_ready';
            this.state.qrCodeDataUrl = qrDataUrl;
            this.state.errorMessage = null;
            this.broadcast('whatsapp_status', this.state);
            this.broadcast('whatsapp_qr', { qrDataUrl });
          } catch (qrErr) {
            console.error('Failed to generate QR data URL:', qrErr);
            this.state.errorMessage = 'فشل في توليد صورة رمز الـ QR';
            this.broadcast('whatsapp_status', this.state);
          }
        }

        if (connection === 'connecting') {
          if (this.state.status !== 'qr_ready') {
            this.state.status = 'connecting';
            this.broadcast('whatsapp_status', this.state);
          }
        }

        if (connection === 'open') {
          console.log('Baileys WhatsApp connection OPENED successfully!');
          this.state.status = 'connected';
          this.state.qrCodeDataUrl = null;
          this.state.reconnectAttempts = 0;
          this.state.lastConnectedAt = new Date().toISOString();
          this.state.errorMessage = null;

          const userJid = this.socket?.user?.id || '';
          this.state.phoneNumber = userJid.split(':')[0] || userJid.split('@')[0] || 'Unknown';
          this.state.pushName = this.socket?.user?.name || 'WhatsApp Business';
          this.broadcast('whatsapp_status', this.state);
          db.addAuditLog(
            'WHATSAPP_CONNECTED',
            `تم اقتران واتساب بنجاح للرقم: ${this.state.phoneNumber}`,
            'system'
          );
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          console.log('Baileys connection closed, status code:', statusCode);

          const shouldReconnect =
            !this.isExplicitLogout &&
            statusCode !== DisconnectReason?.loggedOut &&
            statusCode !== 401;

          this.state.status = shouldReconnect ? 'reconnecting' : 'disconnected';
          this.state.qrCodeDataUrl = null;

          if (statusCode === DisconnectReason?.loggedOut || statusCode === 401) {
            this.state.errorMessage = 'تم إنهاء الجلسة أو تسجيل الخروج من الهاتف. يرجى مسح الرمز من جديد.';
            this.clearAuthStorage();
          } else {
            this.state.errorMessage =
              lastDisconnect?.error?.message || 'تم قطع الاتصال المؤقت بجهاز WhatsApp.';
          }

          this.broadcast('whatsapp_status', this.state);

          if (shouldReconnect && this.state.reconnectAttempts < 5) {
            this.state.reconnectAttempts += 1;
            const backoffMs = Math.min(3000 * Math.pow(1.5, this.state.reconnectAttempts), 25000);
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = setTimeout(() => {
              console.log(`Attempting reconnect #${this.state.reconnectAttempts}...`);
              this.startConnection(false);
            }, backoffMs);
          }
        }
      });

      // Handle incoming messages
      this.socket.ev.on('messages.upsert', async (m: any) => {
        if (!m.messages || m.messages.length === 0) return;

        for (const msg of m.messages) {
          if (!msg.message || msg.key.fromMe) continue;

          const messageId = msg.key.id;
          if (this.processedMessageIds.has(messageId)) continue;
          this.processedMessageIds.add(messageId);

          const remoteJid = msg.key.remoteJid;
          if (!remoteJid || remoteJid.includes('@g.us')) continue; // Skip group messages for now

          const senderPhone = remoteJid.split('@')[0];
          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            '';

          console.log(`Received WhatsApp message from ${senderPhone}: ${text}`);

          // Find or create customer
          let customer = db.getCustomerByPhone(senderPhone);
          if (!customer) {
            const customerId = `cust-${senderPhone}`;
            customer = {
              id: customerId,
              phoneNumber: senderPhone,
              name: msg.pushName || `عميل ${senderPhone.slice(-4)}`,
              tags: ['جديد'],
              notes: 'عميل جديد تواصل عبر واتساب',
              stage: 'lead',
              language: /[\u0590-\u05FF]/.test(text) ? 'he' : 'ar',
              unreadCount: 1,
              lastMessageAt: new Date().toISOString(),
              totalSpent: 0,
              ordersCount: 0,
              memory: {
                interests: [],
                objections: [],
                budget: null,
                preferredLanguage: /[\u0590-\u05FF]/.test(text) ? 'he' : 'ar',
                notes: '',
                keyFacts: [],
              },
            };
            db.saveCustomer(customer);
          }

          // Record incoming message in database
          const incomingMsg: ChatMessage = {
            id: `msg-${messageId}`,
            customerId: customer.id,
            sender: 'customer',
            text: text || '[ملف وسائط]',
            timestamp: new Date().toISOString(),
            status: 'read',
          };
          db.addMessage(customer.id, incomingMsg);
          this.broadcast('chat_message', { customerId: customer.id, message: incomingMsg });

          // Check if auto-reply is enabled in settings
          const settings = db.getSettings();
          if (!settings.autoReplyEnabled) {
            console.log('Auto-reply is disabled in settings. Skipping automatic response.');
            continue;
          }

          // Process response with chosen AI provider (Gemini or OpenAI)
          if (this.conversationLocks.get(customer.id)) {
            console.log(`Conversation lock active for ${customer.id}, queueing or skipping duplicate reply`);
            continue;
          }

          this.conversationLocks.set(customer.id, true);
          try {
            let aiResult: any;
            const startTime = Date.now();

            if (settings.provider === 'openai') {
              console.log(`Dispatching message to OpenAI (${settings.modelOpenAI})...`);
              aiResult = await processCustomerMessageWithOpenAI({
                customer,
                incomingText: text,
              });
            } else {
              console.log(`Dispatching message to Gemini (${settings.modelGemini})...`);
              aiResult = await processCustomerMessageWithGemini({
                customer,
                incomingText: text,
              });
            }

            const latencyMs = Date.now() - startTime;
            const replyMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              customerId: customer.id,
              sender: 'ai',
              text: aiResult.replyText,
              timestamp: new Date().toISOString(),
              status: 'sent',
              aiProvider: settings.provider,
              meta: {
                modelUsed: aiResult.modelUsed,
                tokens: aiResult.tokensEstimate,
                latencyMs,
              },
            };

            db.addMessage(customer.id, replyMsg);
            this.broadcast('chat_message', { customerId: customer.id, message: replyMsg });

            // Send reply via Baileys socket
            if (this.socket && this.state.status === 'connected') {
              await this.socket.sendMessage(remoteJid, { text: aiResult.replyText });
            }
          } catch (replyErr: any) {
            console.error('Failed to generate or send AI reply:', replyErr);
            db.addAuditLog('AI_REPLY_FAILED', `فشل توليد رد ${settings.provider}: ${replyErr.message}`, 'system');
          } finally {
            this.conversationLocks.delete(customer.id);
          }
        }
      });
    } catch (err: any) {
      console.error('Fatal Baileys socket error:', err);
      this.state.status = 'error';
      this.state.errorMessage = err.message || 'حدث خطأ أثناء تشغيل عميل WhatsApp Baileys';
      this.broadcast('whatsapp_status', this.state);
    }
  }

  public async disconnect(): Promise<void> {
    this.isExplicitLogout = true;
    clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      try {
        await this.socket.logout();
      } catch (_) {}
      try {
        this.socket.end();
      } catch (_) {}
      this.socket = null;
    }
    this.clearAuthStorage();
    this.state = {
      status: 'disconnected',
      qrCodeDataUrl: null,
      phoneNumber: null,
      pushName: null,
      platform: 'WhatsApp Business Web Multi-Device (Baileys)',
      lastConnectedAt: null,
      errorMessage: null,
      isLiveBaileys: true,
      reconnectAttempts: 0,
    };
    this.broadcast('whatsapp_status', this.state);
    db.addAuditLog('WHATSAPP_DISCONNECTED', 'تم قطع اتصال واتساب ومسح بيانات الجلسة الحالية', 'admin');
  }

  public async sendMessage(remoteJid: string, text: string): Promise<boolean> {
    if (!this.socket || this.state.status !== 'connected') {
      return false;
    }
    try {
      const fullJid = remoteJid.includes('@') ? remoteJid : `${remoteJid}@s.whatsapp.net`;
      await this.socket.sendMessage(fullJid, { text });
      return true;
    } catch (e) {
      console.error('Failed to send WhatsApp manual message:', e);
      return false;
    }
  }

  private clearAuthStorage(): void {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        const files = fs.readdirSync(AUTH_DIR);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(AUTH_DIR, file));
          } catch (_) {}
        }
      }
    } catch (e) {
      console.error('Error clearing Baileys auth storage:', e);
    }
  }
}

export const whatsappManager = new WhatsAppManager();
