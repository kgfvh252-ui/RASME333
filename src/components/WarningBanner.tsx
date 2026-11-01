import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export const WarningBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-amber-300 font-semibold">تنويه تقني وتشغيلي:</strong> هذا النظام يعمل كعميل ويب متعدد الأجهزة (Baileys Multi-Device) مدمج مع محركات الذكاء الاصطناعي (Gemini و OpenAI). الردود التلقائية الحية متوقفة افتراضياً لحمايتك وتمكينك من تجربة المحاكي أولاً.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/80 hover:text-amber-200 p-1 transition"
        title="إغلاق التنبيه"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
