import React, { useState, useEffect } from 'react';
import {
  Save,
  Cpu,
  Key,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  Info,
  Radio,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Package,
  Ban,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { AiSettings, AiProvider } from '../types/index.js';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'engines' | 'safety'>('instructions');

  const [settings, setSettings] = useState<AiSettings & { openaiConfigured?: boolean; geminiConfigured?: boolean }>({
    provider: 'gemini',
    autoReplyEnabled: false,
    modelGemini: 'gemini-3.8-flash',
    modelOpenAI: 'gpt-4o',
    salesTone: 'consultative',
    responseLength: 'concise',
    languages: ['ar', 'he', 'en'],
    systemPrompt: '',
    personaPrompt: '',
    toneAndStylePrompt: '',
    salesAndPersuasionRules: '',
    productSpecificInstructions: '',
    prohibitedResponsesPrompt: '',
    temperature: 0.7,
    maxTokens: 600,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = () => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (_) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Primary Engine: Gemini
            </span>
            <span className="text-xs text-slate-400">OpenAI Backup Available</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="h-6 w-6 text-emerald-400" />
            <span>إعدادات الذكاء الاصطناعي وتعليمات المبيعات</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            تحكم دقيق في شخصية المساعد، أسلوب الرد، قواعد الإقناع، تعليمات المنتجات، والممنوعات الصارمة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs animate-bounce">
              <CheckCircle2 className="h-4 w-4" />
              <span>تم حفظ التعليمات والإعدادات</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-950"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('instructions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'instructions'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="h-4 w-4 text-emerald-400" />
          <span>تعليمات الذكاء الاصطناعي (AI Instructions)</span>
        </button>

        <button
          onClick={() => setActiveTab('engines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'engines'
              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Cpu className="h-4 w-4 text-blue-400" />
          <span>محركات الذكاء (Gemini & OpenAI)</span>
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'safety'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <span>الأمان ونبرة الرد العامة</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ==================== TAB 1: AI INSTRUCTIONS ==================== */}
        {activeTab === 'instructions' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">تحكم كامل ومباشر في عقل مساعد المبيعات</p>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  هذه التعليمات يتم حقنها فورياً في كل رد يولّده محرك Gemini. يمكنك تخصيص نبرته، ومنع الإلحاح أو الأسئلة المكررة، وضبط تفاصيل أسعار ومزايا المنتجات، وحظر العبارات المرفوضة بحرية تامة.
                </p>
              </div>
            </div>

            {/* 1. تعليمات شخصية المساعد */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>1. تعليمات شخصية المساعد (Persona Instructions)</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">طبيعي مثل ChatGPT</span>
              </div>
              <p className="text-xs text-slate-400">
                حدد هوية المساعد، وروحه في الحوار، وكيف يتعامل كإنسان ذكي ولبق وسريع البديهة.
              </p>
              <textarea
                rows={4}
                value={settings.personaPrompt || ''}
                onChange={(e) => setSettings({ ...settings, personaPrompt: e.target.value })}
                placeholder="أدخل تعليمات شخصية المساعد..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* 2. أسلوب الرد على العملاء */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-sky-400" />
                  <span>2. أسلوب الرد على العملاء (Tone & Style)</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">اختصار وعدم تكرار</span>
              </div>
              <p className="text-xs text-slate-400">
                يشمل قواعد الإيجاز، الرد على "مرحبا" بتحية فقط، وعدم تكرار سؤال "بدك تطلب؟" في نهاية الرسائل.
              </p>
              <textarea
                rows={5}
                value={settings.toneAndStylePrompt || ''}
                onChange={(e) => setSettings({ ...settings, toneAndStylePrompt: e.target.value })}
                placeholder="أدخل أسلوب وطريقة الرد..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            {/* 3. قواعد البيع والإقناع */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  <span>3. قواعد البيع والإقناع (Sales & Persuasion Rules)</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">القيمة مقابل السعر</span>
              </div>
              <p className="text-xs text-slate-400">
                إبراز القيمة العملية، إعطاء السعر الدقيق فوراً عند السؤال ("كم السعر؟") مع الضمان، والتعامل مع اعتراضات الأسعار.
              </p>
              <textarea
                rows={5}
                value={settings.salesAndPersuasionRules || ''}
                onChange={(e) => setSettings({ ...settings, salesAndPersuasionRules: e.target.value })}
                placeholder="أدخل استراتيجيات وقواعد البيع والإقناع..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* 4. تعليمات خاصة بكل منتج */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-teal-400" />
                  <span>4. تعليمات خاصة بكل منتج (Product-Specific Instructions)</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">كتالوج ومزايا محددة</span>
              </div>
              <p className="text-xs text-slate-400">
                توجيهات محددة لكل منتج (مثل سماعات X1، ساعة Ultra Watch 3، منقي الهواء، الشاحن اللاسلكي) ونقاط القوة التسويقية.
              </p>
              <textarea
                rows={6}
                value={settings.productSpecificInstructions || ''}
                onChange={(e) => setSettings({ ...settings, productSpecificInstructions: e.target.value })}
                placeholder="أدخل التوجيهات الخاصة بالمنتجات..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {/* 5. تعليمات ممنوعات الرد */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Ban className="h-4 w-4 text-rose-400" />
                  <span>5. تعليمات ممنوعات الرد (Prohibited Responses & Constraints)</span>
                </label>
                <span className="text-[11px] text-rose-400 font-mono">محاذير صارمة</span>
              </div>
              <p className="text-xs text-slate-400">
                حظر تكرار "بدك تطلب؟"، منع اختلاق الأسعار والمواصفات، منع الإلحاح، ومنع مخالفة لغة الزبون.
              </p>
              <textarea
                rows={6}
                value={settings.prohibitedResponsesPrompt || ''}
                onChange={(e) => setSettings({ ...settings, prohibitedResponsesPrompt: e.target.value })}
                placeholder="أدخل المحاذير والممنوعات الصارمة..."
                className="w-full bg-slate-950 border border-rose-950/60 rounded-xl p-3.5 text-xs text-rose-200 leading-relaxed font-sans focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ENGINES & MODELS ==================== */}
        {activeTab === 'engines' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-indigo-400" />
                <span>اختيار محرك الذكاء الاصطناعي (AI Provider)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gemini Choice - Primary */}
                <label
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
                    settings.provider === 'gemini'
                      ? 'bg-blue-950/40 border-blue-500/60 text-blue-200 shadow-md shadow-blue-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={settings.provider === 'gemini'}
                    onChange={() => setSettings({ ...settings, provider: 'gemini' })}
                    className="mt-1 accent-blue-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">Google Gemini (المحرك الأساسي المعتمد)</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                        الأساسي (Primary)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      سريع جداً، يفهم العربية والعبرية وقراءة الصور، معالج تلقائي للأخطاء، ولا يتطلب رصيداً خارجياً.
                    </p>
                  </div>
                </label>

                {/* OpenAI Choice - Backup */}
                <label
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
                    settings.provider === 'openai'
                      ? 'bg-teal-950/30 border-teal-500/50 text-teal-200 shadow-md shadow-teal-950/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={settings.provider === 'openai'}
                    onChange={() => setSettings({ ...settings, provider: 'openai' })}
                    className="mt-1 accent-teal-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">OpenAI Engine (خيار احتياطي متاح)</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                        احتياطي (Backup)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      محرك احتياطي جاهز، يمكن استخدامه عند إضافة المفتاح في لوحة الأسرار متى أردت.
                    </p>
                  </div>
                </label>
              </div>

              {/* Model selection dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <label className="text-xs font-medium text-blue-300 block mb-1.5">
                    موديل Gemini المعتمد:
                  </label>
                  <select
                    value={settings.modelGemini || 'gemini-3.8-flash'}
                    onChange={(e) => setSettings({ ...settings, modelGemini: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash (الأسرع والأفضل للمحادثات الحية)</option>
                    <option value="gemini-flash-latest">gemini-flash-latest (الموديل المحدث)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-teal-300 block mb-1.5">
                    موديل OpenAI الاحتياطي:
                  </label>
                  <select
                    value={settings.modelOpenAI || 'gpt-4o'}
                    onChange={(e) => setSettings({ ...settings, modelOpenAI: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                  >
                    <option value="gpt-4o">gpt-4o (الموصى به للصور والمبيعات)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (اقتصادي)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* API Keys Health Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span>حالة Google Gemini</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    متصل وجاهز للعمل
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  المفتاح محمّل بنجاح في بيئة الخادم وجاهز لمعالجة المحادثات والصور.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200 flex items-center gap-2">
                    <Key className="h-4 w-4 text-teal-400" />
                    <span>حالة OpenAI (الاحتياطي)</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      settings.openaiConfigured
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settings.openaiConfigured ? 'مفتاح متصل' : 'اختياري (غير مطلوب حالياً)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  لا حاجة لرصيد حالياً؛ يعمل كخيار بديل عند الرغبة في إضافته من إدارة الأسرار.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: SAFETY & TONE ==================== */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            {/* Live WhatsApp Auto-reply Safety Toggle */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    <span>الرد التلقائي الحي على رسائل WhatsApp</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    متوقف افتراضياً لسلامتك ولتمكينك من اختبار المحاكي أولاً قبل الإطلاق الفعلي.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, autoReplyEnabled: !settings.autoReplyEnabled })
                  }
                  className={`p-1 rounded-xl transition ${
                    settings.autoReplyEnabled ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                >
                  {settings.autoReplyEnabled ? (
                    <ToggleRight className="h-9 w-9 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Tone & Length */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>إعدادات النبرة وحجم الرد</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    النبرة العامة:
                  </label>
                  <select
                    value={settings.salesTone}
                    onChange={(e) => setSettings({ ...settings, salesTone: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="consultative">استشارية احترافية (طبيعية وذكية كشخص حقيقي)</option>
                    <option value="friendly">ودودة ومرحبة</option>
                    <option value="direct">مباشرة وسريعة</option>
                    <option value="premium">فاخرة ورسمية</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    مستوى الإيجاز:
                  </label>
                  <select
                    value={settings.responseLength}
                    onChange={(e) => setSettings({ ...settings, responseLength: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="concise">مختصر ومباشر (الموصى به لواتساب - أجب عن السؤال فقط)</option>
                    <option value="detailed">مفصل وغني بالفوائد</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Bottom Save Action */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            تُحفظ التعديلات دائماً في قاعدة البيانات المحلية وتُطبق فوراً على المحاكي وواتساب.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-950"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'جارٍ الحفظ...' : 'حفظ جميع التعليمات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
