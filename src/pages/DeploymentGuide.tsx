import React from 'react';
import { Server, Terminal, Shield, CheckCircle2, Cpu, Key, ExternalLink } from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Server className="h-6 w-6 text-indigo-400" />
          <span>دليل النشر والاستضافة الدائمة (Production Deployment)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          تعليمات استضافة NEXO AI Sales CRM على خوادم Cloud Run أو VPS أو Docker مع Baileys المستمر.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-teal-400" />
          <span>إعداد متغيرات البيئة السرية (Environment Variables)</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-slate-300 border border-slate-800">
            <p className="text-slate-500"># مفاتيح الذكاء الاصطناعي (يتم حفظها في الأسرار السحابية):</p>
            <p><span className="text-blue-400">GEMINI_API_KEY</span>="AIzaSy..."</p>
            <p><span className="text-teal-400">OPENAI_API_KEY</span>="sk-proj-..."</p>
            <p className="text-slate-500 mt-2"># منفذ الخادم والتطبيق:</p>
            <p><span className="text-slate-400">PORT</span>=3000</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span>أمر التشغيل المباشر</span>
        </h3>
        <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800">
          npm run build && npm start
        </div>
      </div>
    </div>
  );
};
