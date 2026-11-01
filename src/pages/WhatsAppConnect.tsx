import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  PowerOff,
  AlertCircle,
  ShieldCheck,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext.js';
import { StatusBadge } from '../components/StatusBadge.js';

interface WhatsAppConnectProps {
  onNavigateToDiagnostics: () => void;
}

export const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ onNavigateToDiagnostics }) => {
  const { whatsappState } = useWebSocket();
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConnect = async (forceFresh = false) => {
    setConnecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceFresh }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'فشل الاتصال بواتساب');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من جلسة واتساب الحالية؟')) {
      return;
    }
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="h-6 w-6 text-emerald-400" />
            <span>ربط وتفعيل جهاز WhatsApp Business (Baileys)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            الاتصال المباشر بتقنية Multi-Device الرسمية بدون واجهات طرف ثالث مكلفة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={whatsappState.status} />
          <button
            onClick={onNavigateToDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
          >
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            <span>فحص الجلسة</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Connection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: QR Code or Connected Card */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {whatsappState.status === 'connected' ? (
            <div className="space-y-4 py-8">
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">الجهاز مقترن بنجاح</h3>
                <p className="text-xs text-slate-400 mt-1">
                  رقم الهاتف المعتمد:{' '}
                  <span className="font-mono text-emerald-400 font-semibold">
                    +{whatsappState.phoneNumber}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  اسم الحساب: {whatsappState.pushName || 'WhatsApp Business'}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 justify-center">
                <button
                  onClick={() => handleConnect(false)}
                  disabled={connecting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${connecting ? 'animate-spin' : ''}`} />
                  <span>تحديث الاتصال</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs text-rose-300 border border-rose-800/40 transition flex items-center gap-1.5"
                >
                  <PowerOff className="h-3.5 w-3.5" />
                  <span>تسجيل الخروج والمسح</span>
                </button>
              </div>
            </div>
          ) : whatsappState.status === 'qr_ready' && whatsappState.qrCodeDataUrl ? (
            <div className="space-y-4 py-4">
              <div className="bg-white p-3 rounded-2xl shadow-xl inline-block mx-auto">
                <img
                  src={whatsappState.qrCodeDataUrl}
                  alt="WhatsApp QR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-semibold animate-pulse">
                  الرمز نشط وجاهز للمسح
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  امسح الرمز من تطبيق واتساب على هاتفك خلال دقيقتين
                </p>
              </div>
              <button
                onClick={() => handleConnect(true)}
                disabled={connecting}
                className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition"
              >
                <RefreshCw className={`h-3 w-3 ${connecting ? 'animate-spin' : ''}`} />
                <span>إعادة طلب رمز جديد</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-8">
              <div className="h-20 w-20 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
                <Smartphone className="h-9 w-9" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">واتساب غير مقترن حالياً</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  اضغط على الزر أدناه لبدء عميل Baileys وتوليد رمز QR لربط رقم مبيعاتك.
                </p>
              </div>
              <button
                onClick={() => handleConnect(false)}
                disabled={connecting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-950 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className={`h-4 w-4 ${connecting ? 'animate-spin' : ''}`} />
                <span>{connecting ? 'جارٍ التشغيل...' : 'بدء الاتصال وإظهار رمز الـ QR'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Step-by-step Instructions & Safety Info */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>خطوات الاقتران عبر الهاتف</span>
            </h3>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>افتح تطبيق واتساب على هاتفك (شخصي أو واتساب أعمال).</li>
              <li>انتقل إلى <strong>الإعدادات (Settings)</strong> أو القائمة الرئيسية الثلاث نقاط.</li>
              <li>اختر <strong>الأجهزة المرتبطة (Linked Devices)</strong>.</li>
              <li>انقر على <strong>ربط جهاز (Link a Device)</strong>.</li>
              <li>وجّه كاميرا الهاتف نحو رمز الـ QR الظاهر في هذه الصفحة.</li>
            </ol>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span>أمان وحفظ الجلسة:</span>
            </div>
            <p>
              يتم حفظ مفاتيح التشفير التلقائية في مسار محلي آمن داخل الخادم. عند إعادة تشغيل الخادم تتم استعادة الجلسة تلقائياً دون الحاجة لمسح الرمز مجدداً ما لم تسجل الخروج يدوياً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
