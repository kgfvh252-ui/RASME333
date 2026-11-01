export type AiProvider = 'gemini' | 'openai';

export type SalesTone = 'consultative' | 'direct' | 'friendly' | 'premium';

export interface WhatsAppSessionState {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'reconnecting' | 'error';
  qrCodeDataUrl: string | null;
  phoneNumber: string | null;
  pushName: string | null;
  platform: string;
  lastConnectedAt: string | null;
  errorMessage: string | null;
  isLiveBaileys: boolean;
  reconnectAttempts: number;
}

export interface CustomerMemory {
  interests: string[];
  objections: string[];
  budget: string | null;
  preferredLanguage: 'ar' | 'he' | 'en';
  notes: string;
  keyFacts: string[];
  adReferral?: {
    headline?: string;
    body?: string;
    sourceUrl?: string;
    campaign?: string;
  };
}

export interface Customer {
  id: string;
  phoneNumber: string;
  name: string;
  tags: string[];
  notes: string;
  stage: 'lead' | 'contacted' | 'negotiation' | 'converted' | 'lost';
  language: 'ar' | 'he' | 'en';
  unreadCount: number;
  lastMessageAt: string;
  totalSpent: number;
  ordersCount: number;
  memory: CustomerMemory;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  customerId: string;
  sender: 'customer' | 'ai' | 'agent';
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'document' | 'video';
  status?: 'sent' | 'delivered' | 'read' | 'pending';
  aiProvider?: AiProvider;
  meta?: {
    modelUsed?: string;
    tokens?: number;
    latencyMs?: number;
    adReferralDetected?: boolean;
    hasImageAttachment?: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  arabicName: string;
  hebrewName: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  sku: string;
  stock: number;
  category: string;
  features: string[];
  imageUrl: string;
  inStock: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  city?: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

export interface PlaybookRule {
  id: string;
  title: string;
  triggerType: 'greeting' | 'pricing' | 'objection' | 'out_of_stock' | 'ad_referral' | 'closing' | 'custom';
  keywords: string[];
  salesObjective: string;
  guidelines: string;
  discountAllowed: boolean;
  maxDiscountPercentage: number;
  enabled: boolean;
}

export interface AiSettings {
  provider: AiProvider;
  autoReplyEnabled: boolean;
  modelGemini: string;
  modelOpenAI: string;
  salesTone: SalesTone;
  responseLength: 'concise' | 'detailed';
  languages: string[];
  systemPrompt: string;
  // Deep AI Sales Instructions
  personaPrompt: string;
  toneAndStylePrompt: string;
  salesAndPersuasionRules: string;
  productSpecificInstructions: string;
  prohibitedResponsesPrompt: string;
  temperature: number;
  maxTokens: number;
  openaiReasoningEffort?: 'low' | 'medium' | 'high';
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface FollowUpTask {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  dueAt: string;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  suggestedAction: string;
  aiGeneratedMessage?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'supervisor' | 'agent';
}
