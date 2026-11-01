import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, ShoppingBag, MapPin, Phone, User, Clock } from 'lucide-react';
import { Order } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = () => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-400" />
            <span>سجل وإدارة طلبات العملاء</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            الطلبات التي تم التقاطها عبر محادثات واتساب المؤتمتة واليدوية.
          </p>
        </div>

        <input
          type="text"
          placeholder="البحث برقم الطلب أو اسم العميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
        />
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#0a1224] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 text-start font-medium">رقم الطلب</th>
                <th className="p-4 text-start font-medium">العميل والهاتف</th>
                <th className="p-4 text-start font-medium">المنتجات المطلوبة</th>
                <th className="p-4 text-start font-medium">عنوان الشحن</th>
                <th className="p-4 text-start font-medium">المبلغ الإجمالي</th>
                <th className="p-4 text-start font-medium">الحالة</th>
                <th className="p-4 text-start font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    لا توجد طلبات مسجلة حالياً
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono font-bold text-indigo-300">{ord.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">+{ord.customerPhone}</p>
                    </td>
                    <td className="p-4 max-w-xs">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="text-slate-300 truncate">
                          {it.productName} <span className="text-slate-500 font-mono">×{it.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{ord.shippingAddress}</td>
                    <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                      {ord.totalAmount} {ord.currency}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
