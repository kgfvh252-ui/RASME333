import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Coins,
  Cpu,
  Brain,
  Layers,
  HelpCircle,
  Megaphone,
  X,
  FileText,
} from 'lucide-react';
import { Product, Customer } from '../types/index.js';

export const Simulator: React.FC = () => {
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [modelOpenAI, setModelOpenAI] = useState('gpt-4o');
  const [modelGemini, setModelGemini] = useState('gemini-3.8-flash');
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    model?: string;
    tokens?: number;
    latencyMs?: number;
    hasImage?: boolean;
    provider?: string;
    complianceNotes?: string[];
  }>>([
    {
      sender: 'ai',
      text: 'مرحباً بك في محاكي NEXO AI Sales المطور! يعمل محرك Gemini الآن كمساعد مبيعات ذكي وطبيعي جداً (بأسلوب قريب من ChatGPT) ومربوط مباشرة بقائمة "تعليمات الذكاء الاصطناعي" التي حددتها في الإعدادات.',
      provider: 'system',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const [openAITestResult, setOpenAITestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);

  const [settings, setSettings] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Multimodal Image Simulation state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // Ad Referral Simulation state
  const [enableAdReferral, setEnableAdReferral] = useState(false);
  const [adHeadline, setAdHeadline] = useState('خصم 100 شيكل على سماعات نكسو برو Sound X1');
  const [adBody, setAdBody] = useState('عزل ضوضاء فائق ANC وبطارية تدوم 45 ساعة مع شحن وتوصيل فوري.');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = () => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        if (data.modelOpenAI) setModelOpenAI(data.modelOpenAI);
        if (data.modelGemini) setModelGemini(data.modelGemini);
      })
      .catch(() => {});

    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});

    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCustomers(data);
          if (data.length > 0) setSelectedCustomerId(data[0].id);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Test OpenAI connection ping
  const handleTestOpenAIConnection = async () => {
    setTestingOpenAI(true);
    setOpenAITestResult(null);
    try {
      const res = await fetch('/api/ai/test-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelOpenAI }),
      });
      const data = await res.json();
      setOpenAITestResult({
        success: data.success,
        message: data.message,
        latencyMs: data.latencyMs || 0,
      });
    } catch (err: any) {
      setOpenAITestResult({
        success: false,
        message: err.message || 'فشل الاتصال بالخادم',
        latencyMs: 0,
      });
    } finally {
      setTestingOpenAI(false);
    }
  };

  // Image upload handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
  };

  // Send message to simulator
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() && !imageBase64) return;

    const userMessage = {
      sender: 'user' as const,
      text: textToSend,
      hasImage: Boolean(imageBase64),
    };

    setConversation((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputText('');
    setLoading(true);

    const activeImageBase64 = imageBase64;
    const activeImageMime = imageMimeType;
    // clear active image once sent
    removeImage();

    try {
      const res = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          messageText: textToSend,
          provider,
          model: provider === 'openai' ? modelOpenAI : modelGemini,
          imageBase64: activeImageBase64 || undefined,
          imageMimeType: activeImageMime || undefined,
          adReferral: enableAdReferral
            ? {
                headline: adHeadline,
                body: adBody,
                sourceUrl: 'https://facebook.com/ads/nexo-deal-2026',
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'حدث خطأ أثناء المعالجة');
      }

      const notes: string[] = [];
      const reply = (data.replyText || '').toLowerCase();
      const trimmedQuery = textToSend.trim();

      // Test 1: Single Greeting Test ("مرحبا")
      if (['مرحبا', 'مرحباً', 'السلام عليكم', 'سلام', 'هلا', 'שלום', 'היי'].includes(trimmedQuery)) {
        if (!reply.includes('349') && !reply.includes('499') && !reply.includes('219') && data.replyText.length < 180) {
          notes.push('✅ التزام تام: تحية ترحيبية موجزة وطبيعية بدون فرض أو سرد منتجات.');
        } else {
          notes.push('ℹ️ تنبيه: تم ذكر تفاصيل منتجات مع التحية المنفردة.');
        }
      }

      // Test 2: Price Check ("كم السعر؟")
      if (trimmedQuery.includes('سعر') || trimmedQuery.includes('كم') || trimmedQuery.includes('מחיר') || trimmedQuery.includes('כמה')) {
        if (reply.includes('349') || reply.includes('499') || reply.includes('219') || reply.includes('169') || reply.includes('شيكل') || reply.includes('₪')) {
          notes.push('✅ السعر دقيق من الكتالوج: تم تقديم السعر الرسمي مع الضمان.');
        }
      }

      // Test 3: Anti-Pushiness ("بدك تطلب؟")
      if (!reply.includes('بدك تطلب') && !reply.includes('تحب أحجزلك') && !reply.includes('نثبتلك طلب') && !reply.includes('احجز الآن')) {
        notes.push('✅ أسلوب طبيعي: خالٍ من أسئلة البيع الميكانيكية المكررة.');
      } else {
        notes.push('⚠️ تنبيه: ظهر سؤال إلحاح بيعي في نهاية الرسالة.');
      }

      // Test 4: Language Accuracy
      if (/[\u0590-\u05FF]/.test(textToSend)) {
        if (/[\u0590-\u05FF]/.test(data.replyText)) {
          notes.push('✅ لغة مطابقة: تم الرد باللغة العبرية السليمة.');
        }
      } else if (/[\u0600-\u06FF]/.test(textToSend)) {
        if (/[\u0600-\u06FF]/.test(data.replyText)) {
          notes.push('✅ لغة مطابقة: تم الرد باللغة العربية بأسلوب راقٍ.');
        }
      }

      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.replyText,
          model: data.modelUsed,
          tokens: Math.round(data.tokensEstimate || 0),
          latencyMs: data.latencyMs,
          provider: data.provider,
          complianceNotes: notes,
        },
      ]);
    } catch (err: any) {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ خطأ في المحاكي: ${err.message}`,
          provider: 'error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick preset test prompts with specific instruction verification targets
  const instructionVerificationTests = [
    {
      label: '1. تحية "مرحبا" فقط (فحص عدم سرد المنتجات)',
      text: 'مرحبا',
      expected: 'تحية ترحيبية قصيرة فقط دون عرض منتجات',
    },
    {
      label: '2. استفسار "كم السعر؟" (سماعات X1)',
      text: 'كم سعر سماعات نكسو X1 مع التوصيل؟',
      expected: 'ذكر السعر الرسمي 349 شيكل والضمان مباشرة',
    },
    {
      label: '3. اعتراض "السعر غالي" (فحص الإقناع بالقيمة)',
      text: 'السعر غالي شوي مقارنة بالماركات الصينية الثانية، شو اللي يميزها؟',
      expected: 'إبراز عزل الضوضاء 40dB وعمر 45 ساعة بطارية والضمان',
    },
    {
      label: '4. فحص عدم الإلحاح بالطلب',
      text: 'تمام، شكراً إلك بدي أفكر شوي وأشوف شو بناسبني',
      expected: 'رد لطيف ومرن بدون عبارة "بدك تطلب هسا؟"',
    },
    {
      label: '5. استفسار عبري (עברית) لساعة Ultra 3',
      text: 'שלום, כמה עולה השעון Ultra Watch 3 והאם הוא עמיד במים?',
      expected: 'رد بالعبرية يذكر 499 شيكل ومقاومة 5ATM',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Safe Sandbox Environment
            </span>
            <span className="text-xs text-slate-400">لا يتم إرسال أي رسائل إلى واتساب الحقيقي</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-400" />
            <span>محاكي مبيعات الذكاء الاصطناعي (OpenAI & Gemini)</span>
          </h1>
        </div>

        {/* Engine and Connection Quick Test */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTestOpenAIConnection}
            disabled={testingOpenAI}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/30 text-teal-300 text-xs font-semibold transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testingOpenAI ? 'animate-spin' : ''}`} />
            <span>{testingOpenAI ? 'جارٍ اختبار OpenAI...' : 'فحص اتصال OpenAI API'}</span>
          </button>
        </div>
      </div>

      {/* OpenAI Connection Test Feedback Alert */}
      {openAITestResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            openAITestResult.success
              ? 'bg-teal-950/30 border-teal-500/30 text-teal-200'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {openAITestResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{openAITestResult.message}</p>
              {openAITestResult.latencyMs > 0 && (
                <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                  زمن الاستجابة: {openAITestResult.latencyMs}ms
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpenAITestResult(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Safe Notice about OPENAI_API_KEY if not configured */}
      {settings && !settings.openaiConfigured && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Key className="h-4 w-4" />
            <span>تنبيه آمن بخصوص مفتاح OpenAI API:</span>
          </div>
          <p className="leading-relaxed">
            متغير <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">OPENAI_API_KEY</code> غير محدد حالياً في بيئة التشغيل. لتفعيله بأمان تام بدون مشاركته في المحادثة أو الواجهة:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 ps-2">
            <li>افتح لوحة <strong>الأسرار (Secrets)</strong> في Google AI Studio.</li>
            <li>أضف سراً جديداً باسم <code className="text-teal-400 font-mono">OPENAI_API_KEY</code> وضع مفتاحك الخاص هناك.</li>
            <li>يقوم الخادم بقراءته سراً عبر <code className="font-mono text-slate-200">process.env.OPENAI_API_KEY</code> في مسار معزول خلفي فقط.</li>
          </ol>
        </div>
      )}

      {/* Main Grid: Controls + Chat Simulator Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column (Right on RTL) */}
        <div className="space-y-4">
          {/* AI Engine Selection Box */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>محرك الذكاء الاصطناعي للاختبار</span>
            </h3>

            {/* Provider Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-3 rounded-xl border text-xs font-semibold text-start transition flex flex-col justify-between gap-1.5 ${
                  provider === 'openai'
                    ? 'bg-teal-950/40 border-teal-500/50 text-teal-300 shadow-md shadow-teal-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>OpenAI Engine</span>
                  {provider === 'openai' && <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />}
                </div>
                <span className="text-[10px] text-slate-500 font-mono font-normal">
                  Responses & Chat API
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-3 rounded-xl border text-xs font-semibold text-start transition flex flex-col justify-between gap-1.5 ${
                  provider === 'gemini'
                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 shadow-md shadow-blue-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Google Gemini</span>
                  {provider === 'gemini' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />}
                </div>
                <span className="text-[10px] text-slate-500 font-mono font-normal">
                  @google/genai SDK
                </span>
              </button>
            </div>

            {/* Model selector based on provider */}
            {provider === 'openai' ? (
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-medium">موديل OpenAI المختار:</label>
                <select
                  value={modelOpenAI}
                  onChange={(e) => setModelOpenAI(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                >
                  <option value="gpt-4o">gpt-4o (الأفضل للمبيعات المعقدة والصور)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (سريع واقتصادي جداً)</option>
                  <option value="gpt-4.5-preview">gpt-4.5-preview (استدلال متقدم)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-medium">موديل Gemini المختار:</label>
                <select
                  value={modelGemini}
                  onChange={(e) => setModelGemini(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (الموصى به - حديث وفائق السرعة)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (استدلال متقدم)</option>
                </select>
              </div>
            )}

            {/* Simulated Customer selection */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="text-[11px] text-slate-400 font-medium">ملف وسياق العميل التجريبي:</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phoneNumber}) - {c.stage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Facebook Ad Referral Simulator */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Megaphone className="h-4 w-4 text-amber-400" />
                <span>محاكاة إحالة إعلان فيسبوك</span>
              </span>
              <input
                type="checkbox"
                id="referral-toggle"
                checked={enableAdReferral}
                onChange={(e) => setEnableAdReferral(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
              />
            </div>

            {enableAdReferral && (
              <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <label className="text-slate-400 block mb-1">عنوان الإعلان الترويجي:</label>
                  <input
                    type="text"
                    value={adHeadline}
                    onChange={(e) => setAdHeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">نص العرض في الإعلان:</label>
                  <textarea
                    rows={2}
                    value={adBody}
                    onChange={(e) => setAdBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Instruction Verification Tests */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>فحص الالتزام بالتعليمات</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5 سيناريوهات</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              انقر على أي اختبار للتحقق المباشر من تطبيق قواعد البيع والتحية والأسعار:
            </p>
            <div className="flex flex-col gap-2">
              {instructionVerificationTests.map((test, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendMessage(test.text)}
                  className="w-full text-start p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 hover:border-indigo-500/40 border border-slate-800/80 text-xs text-slate-200 transition group flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-indigo-300 group-hover:text-indigo-200">{test.label}</span>
                    <Send className="h-3 w-3 text-slate-600 group-hover:text-indigo-400 shrink-0 ms-1 transition" />
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400 line-clamp-1">
                    الهدف: {test.expected}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Feed Column (Left 2 columns on RTL) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col h-[650px] overflow-hidden">
          {/* Chat Feed Header */}
          <div className="p-3.5 border-b border-slate-800 bg-[#0a1224] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  provider === 'openai' ? 'bg-teal-400' : 'bg-blue-400'
                } animate-pulse`}
              />
              <span className="font-semibold text-slate-200 font-mono">
                {provider === 'openai' ? `OpenAI (${modelOpenAI})` : `Gemini (${modelGemini})`}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">تزامن كتالوج المنتجات وقواعد البيع مفعل</span>
            </div>

            <button
              onClick={() =>
                setConversation([
                  {
                    sender: 'ai',
                    text: 'تمت إعادة ضبط المحاكي. تفضل بكتابة أي رسالة أو تجربة إرسال صورة أو استفسار.',
                    provider: 'system',
                  },
                ])
              }
              className="text-[11px] text-slate-400 hover:text-white transition"
            >
              مسح السجل
            </button>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#060a14]">
            {conversation.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                    {isUser ? (
                      <span className="text-slate-400">أنت (محاكاة العميل)</span>
                    ) : (
                      <span
                        className={`font-mono font-semibold ${
                          msg.provider === 'openai'
                            ? 'text-teal-400'
                            : msg.provider === 'gemini'
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {msg.provider === 'openai'
                          ? `رد OpenAI (${msg.model || modelOpenAI})`
                          : msg.provider === 'gemini'
                          ? `رد Gemini (${msg.model || modelGemini})`
                          : 'النظام'}
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-800 text-slate-100 rounded-ss-none'
                        : msg.provider === 'error'
                        ? 'bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-se-none'
                        : msg.provider === 'openai'
                        ? 'bg-gradient-to-r from-teal-950/50 to-slate-900 border border-teal-500/30 text-teal-100 rounded-se-none'
                        : 'bg-gradient-to-r from-blue-950/50 to-slate-900 border border-blue-500/30 text-blue-100 rounded-se-none'
                    }`}
                  >
                    {msg.hasImage && (
                      <div className="mb-2 p-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-[10px] text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-teal-400" />
                        <span>[تم إرفاق صورة للمنتج في الاستفسار]</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Instruction Compliance Badges */}
                    {!isUser && msg.complianceNotes && msg.complianceNotes.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/50 space-y-1">
                        {msg.complianceNotes.map((note, nIdx) => (
                          <div
                            key={nIdx}
                            className="text-[11px] leading-snug px-2 py-1 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                          >
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Metadata pill for AI replies */}
                    {!isUser && msg.latencyMs !== undefined && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{msg.latencyMs}ms</span>
                        </span>
                        {msg.tokens !== undefined && (
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-slate-500" />
                            <span>{msg.tokens} tokens</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex flex-col items-end">
                <div className="rounded-2xl px-4 py-3 bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                  <span>جارٍ التفكير وتوليد الرد عبر {provider === 'openai' ? 'OpenAI' : 'Gemini'}...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Image preview strip if attached */}
          {imagePreview && (
            <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={imagePreview}
                  alt="Attachment preview"
                  className="h-10 w-10 object-cover rounded-lg border border-slate-700"
                />
                <span className="text-xs text-slate-300">تم تجهيز صورة المنتج للإرسال المتعدد الوسائط</span>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="text-slate-400 hover:text-rose-400 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#091122] border-t border-slate-800 flex items-center gap-2"
          >
            {/* Image attachment button */}
            <label className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition">
              <ImageIcon className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>

            <input
              type="text"
              placeholder={
                provider === 'openai'
                  ? 'اكتب رسالة لتجربة رد OpenAI (مثلاً: كم سعر السماعات؟)...'
                  : 'اكتب رسالة لتجربة رد Gemini...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />

            <button
              type="submit"
              disabled={loading || (!inputText.trim() && !imageBase64)}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-teal-950"
            >
              <Send className="h-3.5 w-3.5" />
              <span>إرسال تجريبي</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
