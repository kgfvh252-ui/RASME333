import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Tag, Check, X, Edit2, Sparkles } from 'lucide-react';
import { Product } from '../types/index.js';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = () => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.arabicName.includes(search) ||
      p.hebrewName.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-400" />
            <span>كتالوج المنتجات والأسعار الرسمية</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مصدر الحقيقة المعتمد لجميع استفسارات الأسعار والمواصفات لكلا محركي Gemini و OpenAI.
          </p>
        </div>

        <input
          type="text"
          placeholder="البحث بالاسم أو SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition"
          >
            <div className="h-44 bg-slate-950 relative overflow-hidden">
              <img
                src={prod.imageUrl}
                alt={prod.name}
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 end-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                  {prod.sku}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md ${
                    prod.inStock ? 'bg-emerald-500/80 text-slate-950' : 'bg-rose-500/80 text-white'
                  }`}
                >
                  {prod.inStock ? `متوفر (${prod.stock})` : 'نفد'}
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-semibold">
                  {prod.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">{prod.arabicName}</h3>
                <h4 className="text-xs text-slate-400 font-medium line-clamp-1">{prod.hebrewName}</h4>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div>
                <div className="space-y-1 mb-3">
                  {prod.features.slice(0, 2).map((feat, i) => (
                    <div key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-white font-mono">
                      {prod.price} {prod.currency}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-xs text-slate-500 line-through ms-2 font-mono">
                        {prod.originalPrice} {prod.currency}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
