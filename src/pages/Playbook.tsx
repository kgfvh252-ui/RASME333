import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ShieldAlert, Sparkles, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { PlaybookRule } from '../types/index.js';

export const Playbook: React.FC = () => {
  const [rules, setRules] = useState<PlaybookRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaybook = () => {
    fetch('/api/playbook')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRules(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlaybook();
  }, []);

  const toggleRule = async (rule: PlaybookRule) => {
    const updated = { ...rule, enabled: !rule.enabled };
    try {
      const res = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      }
    } catch (_) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            <span>دليل وقواعد البيع الذكي (Sales Playbook)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            القواعد السلوكية والتفاوضية التي يتبعها كل من OpenAI و Gemini عند الرد على العملاء.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
              rule.enabled
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-500/30">
                  {rule.triggerType}
                </span>
                <button
                  onClick={() => toggleRule(rule)}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title={rule.enabled ? 'إيقاف القاعدة' : 'تفعيل القاعدة'}
                >
                  {rule.enabled ? (
                    <ToggleRight className="h-7 w-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-slate-600" />
                  )}
                </button>
              </div>

              <h3 className="text-sm font-bold text-white">{rule.title}</h3>

              <div className="text-xs text-slate-300 space-y-1">
                <p className="text-slate-400 font-semibold">هدف المبيعات:</p>
                <p className="leading-relaxed">{rule.salesObjective}</p>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p className="text-slate-400 font-semibold">توجيه المحادثة:</p>
                <p className="leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  {rule.guidelines}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                الخصم المسموح:{' '}
                <strong className={rule.discountAllowed ? 'text-amber-400' : 'text-slate-500'}>
                  {rule.discountAllowed ? `حتى ${rule.maxDiscountPercentage}%` : 'غير مسموح'}
                </strong>
              </span>
              <span className="text-slate-500 font-mono">
                {rule.keywords.slice(0, 3).join(', ')}...
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
