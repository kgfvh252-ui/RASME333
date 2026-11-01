import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  MessageSquare,
  QrCode,
  Bot,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge.js';
import { useWebSocket } from '../context/WebSocketContext.js';
import { Customer, Order } from '../types/index.js';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { whatsappState } = useWebSocket();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([custData, ordData, settsData]) => {
        setCustomers(Array.isArray(custData) ? custData : []);
        setOrders(Array.isArray(ordData) ? ordData : []);
        setSettings(settsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Top Welcome / Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NEXO AI Multi-Engine
            </span>
            <span className="text-xs text-slate-400">Gemini & OpenAI</span>
          </div>
          <h1 className="text-2xl font-bold text-white">لوحة قيادة المبيعات والمحادثات الذكية</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            متابعة فورية للعملاء المحتملين، وتوصيات المبيعات المؤتمتة، وإدارة كتالوج المنتجات مع محاكاة ردود الذكاء الاصطناعي بدقة عالية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-950"
          >
            <Bot className="h-4 w-4" />
            <span>تجربة المحاكي (Sandbox)</span>
          </button>
          <button
            onClick={() => onNavigate('whatsapp_connect')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition"
          >
            <QrCode className="h-4 w-4" />
            <span>حالة واتساب</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">إجمالي المبيعات المؤكدة</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalSales.toLocaleString()} ₪</div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{orders.length} طلبات مسجلة بالكامل</span>
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">العملاء النشطين</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{customers.length}</div>
          <p className="text-xs text-slate-400 mt-1">تزامن مباشر مع ذاكرة العميل</p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">طلبات قيد المتابعة</span>
            <ShoppingBag className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{pendingOrders.length}</div>
          <p className="text-xs text-amber-400 mt-1">جاهزة للتجهيز والشحن</p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">حالة محرك الذكاء</span>
            <Bot className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-base font-bold text-teal-300 font-mono">
            {settings?.provider === 'openai' ? `OpenAI (${settings?.modelOpenAI || 'gpt-4o'})` : `Gemini (${settings?.modelGemini || '2.5-flash'})`}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                settings?.autoReplyEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings?.autoReplyEnabled ? 'رد حي نشط' : 'وضع المحاكي الآمن'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Conversations & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h3 className="font-semibold text-slate-200 text-sm">أحدث محادثات العملاء</h3>
            </div>
            <button
              onClick={() => onNavigate('inbox')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>فتح الصندوق</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 space-y-2 flex-1">
            {customers.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('inbox')}
                className="pt-2 cursor-pointer hover:bg-slate-800/40 p-2 rounded-lg transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                    {c.name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-100">{c.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">+{c.phoneNumber}</p>
                  </div>
                </div>
                <div className="text-end">
                  <StatusBadge status={c.stage} size="sm" />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(c.lastMessageAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Orders */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-indigo-400" />
              <h3 className="font-semibold text-slate-200 text-sm">أحدث الطلبات المؤكدة</h3>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>جميع الطلبات</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 space-y-2 flex-1">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد طلبات مسجلة حتى الآن.</p>
            ) : (
              orders.slice(0, 4).map((o) => (
                <div
                  key={o.id}
                  onClick={() => onNavigate('orders')}
                  className="pt-2 cursor-pointer hover:bg-slate-800/40 p-2 rounded-lg transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-300 font-bold">{o.orderNumber}</span>
                      <span className="text-xs text-slate-300 font-medium">{o.customerName}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                      {o.items.map((it) => `${it.productName} (${it.quantity})`).join(', ')}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="font-mono text-xs font-bold text-white">
                      {o.totalAmount} {o.currency}
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={o.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
