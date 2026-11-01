import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  User,
  Bot,
  Sparkles,
  Phone,
  Tag,
  Clock,
  CheckCheck,
  BrainCircuit,
  ShoppingBag,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext.js';
import { Customer, ChatMessage } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';

export const Inbox: React.FC = () => {
  const { addListener } = useWebSocket();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCustomers(data);
          if (!selectedCustomerId && data.length > 0) {
            setSelectedCustomerId(data[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchMessages = (cId: string) => {
    fetch(`/api/customers/${cId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchMessages(selectedCustomerId);
      fetch(`/api/customers/${selectedCustomerId}/read`, { method: 'POST' }).catch(() => {});
    }
  }, [selectedCustomerId]);

  // Listen to incoming messages in real-time
  useEffect(() => {
    const unsubMsg = addListener('chat_message', (payload) => {
      if (payload?.customerId === selectedCustomerId) {
        setMessages((prev) => [...prev, payload.message]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      fetchCustomers();
    });

    return () => {
      unsubMsg();
    };
  }, [selectedCustomerId, addListener]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCustomerId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          sender: 'agent',
        }),
      });
      if (res.ok) {
        setInputText('');
        fetchMessages(selectedCustomerId);
      }
    } catch (_) {
    } finally {
      setSending(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery)
  );

  return (
    <div className="h-[calc(100vh-140px)] flex rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
      {/* 1. Customer List (Left side in RTL) */}
      <div className="w-80 border-e border-slate-800 flex flex-col shrink-0 bg-[#0a1224]">
        {/* Search Header */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-500 absolute start-3 top-2.5" />
            <input
              type="text"
              placeholder="البحث بالاسم أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg ps-9 pe-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Customer Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {filteredCustomers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">لا توجد محادثات مطابقة</div>
          ) : (
            filteredCustomers.map((cust) => {
              const isSelected = cust.id === selectedCustomerId;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                    isSelected ? 'bg-slate-800/80 border-s-4 border-emerald-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                    {cust.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-100 truncate">{cust.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(cust.lastMessageAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">+{cust.phoneNumber}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {cust.language.toUpperCase()}
                        </span>
                        {cust.tags.slice(0, 1).map((t, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300">
                            {t}
                          </span>
                        ))}
                      </div>
                      {cust.unreadCount > 0 && (
                        <span className="h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                          {cust.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Chat Pane (Center) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070d1a]">
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {selectedCustomer.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{selectedCustomer.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">+{selectedCustomer.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={selectedCustomer.stage} size="sm" />
                <button
                  onClick={() => fetchMessages(selectedCustomer.id)}
                  title="تحديث الرسائل"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  لا توجد رسائل سابقة مع هذا العميل
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.sender === 'customer';
                  const isAI = m.sender === 'ai';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                        {isAI ? (
                          <span className="flex items-center gap-1 text-teal-400 font-semibold font-mono">
                            <Bot className="h-3 w-3" />
                            {m.aiProvider === 'openai' ? 'رد نكسو (OpenAI)' : 'رد نكسو (Gemini)'}
                          </span>
                        ) : isUser ? (
                          <span>{selectedCustomer.name}</span>
                        ) : (
                          <span className="text-slate-400 font-medium">مشرف المبيعات</span>
                        )}
                        <span>•</span>
                        <span className="font-mono">
                          {new Date(m.timestamp).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-slate-800 text-slate-100 rounded-ss-none'
                            : isAI
                            ? 'bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 text-teal-100 rounded-se-none'
                            : 'bg-emerald-600 text-slate-950 font-medium rounded-se-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        {m.meta?.modelUsed && (
                          <p className="mt-1 text-[9px] text-slate-500 font-mono text-end border-t border-slate-700/40 pt-1">
                            {m.meta.modelUsed} {m.meta.latencyMs ? `• ${m.meta.latencyMs}ms` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="اكتب رداً يدوياً أو رسالة للعميل..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>إرسال</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            حدد عميلاً لعرض سجل المحادثة
          </div>
        )}
      </div>

      {/* 3. Customer Memory & Profile Inspector (Right Side) */}
      {selectedCustomer && (
        <div className="w-72 border-s border-slate-800 p-4 bg-[#091122] flex flex-col shrink-0 overflow-y-auto space-y-4">
          <div className="text-center pb-3 border-b border-slate-800">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold text-base mx-auto mb-2 shadow-lg">
              {selectedCustomer.name.slice(0, 2)}
            </div>
            <h4 className="text-sm font-bold text-white">{selectedCustomer.name}</h4>
            <p className="text-xs text-slate-400 font-mono">+{selectedCustomer.phoneNumber}</p>
          </div>

          {/* AI Memory Snapshot */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <BrainCircuit className="h-4 w-4" />
              <span>ذاكرة وسياق العميل (AI Memory)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-2">
              <div>
                <span className="text-slate-500 block">اللغة المفضلة:</span>
                <span className="font-semibold text-slate-200">
                  {selectedCustomer.memory?.preferredLanguage === 'he' ? 'العبرية (עברית)' : 'العربية'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">الاهتمامات المسجلة:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCustomer.memory?.interests?.length ? (
                    selectedCustomer.memory.interests.map((it, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[10px]">
                        {it}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">لا يوجد بعد</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block">الميزانية المقدرة:</span>
                <span className="font-mono text-slate-300">
                  {selectedCustomer.memory?.budget || 'غير محددة'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">حقائق وملاحظات مثبتة:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  {selectedCustomer.notes || selectedCustomer.memory?.notes || 'لا توجد ملاحظات خاصة'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
