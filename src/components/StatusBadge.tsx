import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'confirmed':
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'connecting':
      case 'reconnecting':
      case 'processing':
      case 'negotiation':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'qr_ready':
      case 'pending':
      case 'lead':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'disconnected':
      case 'cancelled':
      case 'lost':
      case 'error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'connected':
        return 'متصل نشط';
      case 'disconnected':
        return 'غير متصل';
      case 'connecting':
        return 'جارٍ الاتصال';
      case 'reconnecting':
        return 'إعادة الاتصال';
      case 'qr_ready':
        return 'الرمز جاهز للمسح';
      case 'error':
        return 'خطأ في الاتصال';
      case 'confirmed':
        return 'مؤكد';
      case 'pending':
        return 'قيد الانتظار';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      case 'lead':
        return 'محتمل جديد';
      case 'negotiation':
        return 'تفاوض';
      case 'converted':
        return 'مشتري مؤكد';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${getStyle()}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {getLabel()}
    </span>
  );
};
