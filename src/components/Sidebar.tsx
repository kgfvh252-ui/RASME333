import React from 'react';
import {
  LayoutDashboard,
  QrCode,
  MessageSquare,
  ShoppingBag,
  Package,
  BookOpen,
  CalendarCheck,
  BarChart3,
  Bot,
  Activity,
  Server,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, unreadCount }) => {
  const { whatsappState } = useWebSocket();
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    {
      id: 'whatsapp_connect',
      label: t('whatsapp'),
      icon: QrCode,
      badge:
        whatsappState.status === 'connected' ? (
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        ),
    },
    {
      id: 'inbox',
      label: t('inbox'),
      icon: MessageSquare,
      count: unreadCount,
    },
    { id: 'simulator', label: 'المحاكي (OpenAI & Gemini)', icon: Bot, highlight: true },
    { id: 'products', label: t('products'), icon: ShoppingBag },
    { id: 'orders', label: t('orders'), icon: Package },
    { id: 'playbook', label: t('playbook'), icon: BookOpen },
    { id: 'follow_ups', label: t('followups'), icon: CalendarCheck },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'diagnostics', label: t('diagnostics'), icon: Activity },
    { id: 'deployment', label: t('deployment'), icon: Server },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#091122] border-e border-slate-800/80 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
              NEXO <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">CRM</span>
            </h1>
            <p className="text-[11px] text-slate-400">نظام المبيعات الذكي</p>
          </div>
        </div>
      </div>

      {/* WhatsApp Connection status pill */}
      <div className="px-3 pt-3">
        <div
          onClick={() => onTabChange('whatsapp_connect')}
          className={`cursor-pointer rounded-lg p-2.5 border transition flex items-center justify-between text-xs ${
            whatsappState.status === 'connected'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                whatsappState.status === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : whatsappState.status === 'connecting' || whatsappState.status === 'qr_ready'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-400'
              }`}
            />
            <span className="font-medium">
              {whatsappState.status === 'connected' ? 'واتساب متصل' : 'واتساب غير مقترن'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {whatsappState.phoneNumber ? whatsappState.phoneNumber.slice(-4) : 'Baileys'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : item.highlight
                  ? 'bg-indigo-950/30 text-indigo-200 border border-indigo-500/20 hover:bg-indigo-900/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge}
                {Boolean(item.count) && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-slate-950 font-bold">
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          <span>Gemini & OpenAI</span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">v2.4.0</span>
      </div>
    </aside>
  );
};
