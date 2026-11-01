import React, { useState } from 'react';
import { Lock, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(password);
      if (!res.success) {
        setError(res.error || 'كلمة المرور غير صحيحة');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c18] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950 mx-auto">
            <Sparkles className="h-6 w-6 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">NEXO AI Sales CRM</h1>
          <p className="text-xs text-slate-400">تسجيل الدخول إلى لوحة إدارة المبيعات</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              كلمة مرور المشرف:
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-500 absolute start-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور (الافتراضية: admin123)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">كلمة المرور الافتراضية: admin123</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'جارٍ التحقق...' : 'دخول اللوحة'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
