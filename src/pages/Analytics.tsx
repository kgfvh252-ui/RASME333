import React from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Bot } from 'lucide-react';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            <span>تقارير وتحليلات المبيعات ونشاط الذكاء الاصطناعي</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مؤشرات الأداء الرئيسية (KPIs)، معدل التحويل، ومقارنة أداء المحادثات.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">معدل التحويل (Conversion Rate)</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">34.8%</div>
          <p className="text-[11px] text-emerald-400 mt-1">+8.2% مقارنة بالشهر السابق</p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">متوسط زمن الاستجابة</span>
            <Bot className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">1.2s</div>
          <p className="text-[11px] text-slate-400 mt-1">استجابة سريعة فورية عبر API</p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">رضا العملاء المقدر</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">4.9 / 5.0</div>
          <p className="text-[11px] text-indigo-400 mt-1">بناءً على نبرة الحوار وحل الاعتراضات</p>
        </div>
      </div>
    </div>
  );
};
