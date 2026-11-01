import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, CheckCircle2, User, Phone, ArrowRight } from 'lucide-react';
import { FollowUpTask } from '../types/index.js';

export const FollowUps: React.FC = () => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([
    {
      id: 'tsk-001',
      customerId: 'cust-972501234567',
      customerName: 'أحمد الخطيب',
      customerPhone: '972501234567',
      dueAt: new Date(Date.now() + 86400000).toISOString(),
      reason: 'متابعة اهتمام العميل بسماعات X1 بعد تأكيد التوصيل',
      status: 'pending',
      suggestedAction: 'إرسال رسالة ترحيبية والاستفسار عن تجربة الاستخدام',
      aiGeneratedMessage: 'مرحباً أستاذ أحمد، نتمنى أن تكون سماعات NEXO X1 قد نالت إعجابك! يسعدنا تقديم أي استفسار حول الضمان أو طريقة التشغيل.',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-sky-400" />
            <span>مهام ومتابعات ما بعد البيع (Follow-ups)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة العملاء المحتملين وتذكيرات الطلبات غير المكتملة لزيادة معدل التحويل.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200">{t.customerName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono">
                {new Date(t.dueAt).toLocaleDateString('ar-EG')}
              </span>
            </div>

            <p className="text-xs text-slate-300">{t.reason}</p>

            {t.aiGeneratedMessage && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold block mb-1">الرسالة المقترحة من الذكاء:</span>
                <p className="text-slate-300 leading-relaxed">{t.aiGeneratedMessage}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
