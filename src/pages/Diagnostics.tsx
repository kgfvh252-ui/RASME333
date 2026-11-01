import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge.js';

export const Diagnostics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const runCheck = () => {
    setLoading(true);
    fetch('/api/diagnostics')
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-sky-400" />
            <span>تشخيص وفحص النظام المباشر (Diagnostics)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مراقبة حالة قاعدة البيانات المحلية، عميل Baileys، واتصال محركات Gemini و OpenAI.
          </p>
        </div>

        <button
          onClick={runCheck}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>إعادة الفحص الآن</span>
        </button>
      </div>

      {loading && !data ? (
        <div className="p-12 text-center text-xs text-slate-400">جارٍ إجراء الفحص الشامل للخدمات...</div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OpenAI Health Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-teal-400" />
                <span>محرك OpenAI API</span>
              </span>
              <StatusBadge status={data.checks.openai.status} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{data.checks.openai.message}</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>الموديل المستهدف:</span>
              <span className="text-teal-300 font-semibold">{data.checks.openai.model}</span>
            </div>
          </div>

          {/* Gemini Health Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>محرك Google Gemini</span>
              </span>
              <StatusBadge status={data.checks.gemini.status} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{data.checks.gemini.message}</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>الموديل المستهدف:</span>
              <span className="text-blue-300 font-semibold">{data.checks.gemini.model}</span>
            </div>
          </div>

          {/* Database Health Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span>قاعدة البيانات والتخزين المحلي</span>
              </span>
              <StatusBadge status={data.checks.database.status} size="sm" />
            </div>
            <p className="text-xs text-slate-300">{data.checks.database.message}</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>سجلات النظام:</span>
              <span className="text-emerald-300">
                {data.checks.database.count.customers} عميل | {data.checks.database.count.products} منتج | {data.checks.database.count.orders} طلب
              </span>
            </div>
          </div>

          {/* WhatsApp Baileys Health Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-sky-400" />
                <span>عميل واتساب (Baileys Multi-Device)</span>
              </span>
              <StatusBadge status={data.checks.whatsapp.status} size="sm" />
            </div>
            <p className="text-xs text-slate-300">
              {data.checks.whatsapp.status === 'connected'
                ? `مقترن بنجاح بالرقم: +${data.checks.whatsapp.phone}`
                : 'العميل بانتظار مسح الرمز أو غير متصل حالياً.'}
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>المنصة:</span>
              <span className="text-sky-300 truncate max-w-xs">{data.checks.whatsapp.platform}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
