import { db } from './db.js';
import { Customer, Product, ChatMessage } from '../src/types/index.js';

function buildCatalogPrompt(products: Product[]): string {
  return products
    .map((p) => {
      const stockStatus = p.inStock ? `متوفر في المخزون (${p.stock} قطعة)` : 'غير متوفر حالياً';
      return `[المنتج: ${p.name}]
الاسم بالعربية: ${p.arabicName}
الاسم بالعبرية: ${p.hebrewName}
السعر الرسمي: ${p.price} ${p.currency} (السعر الأصلي: ${p.originalPrice || p.price} ${p.currency})
رمز SKU: ${p.sku}
حالة التوفر: ${stockStatus}
الوصف: ${p.description}
المميزات الرئيسية:
${p.features.map((f) => `- ${f}`).join('\n')}
رابط المعاينة: ${p.imageUrl}
-----------------------`;
    })
    .join('\n\n');
}

/**
 * Checks if OPENAI_API_KEY is present in process.env
 */
export function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return typeof key === 'string' && key.trim().length > 10;
}

/**
 * Validates connection with OpenAI API using a minimal test ping
 */
export async function testOpenAIConnection(modelName = 'gpt-4o'): Promise<{
  success: boolean;
  model: string;
  latencyMs: number;
  message: string;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      model: modelName,
      latencyMs: 0,
      message: 'لم يتم العثور على OPENAI_API_KEY في متغيرات البيئة. يرجى إضافته من لوحة الأسرار (Secrets) بأمان.',
    };
  }

  const startTime = Date.now();
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: modelName || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a test ping responder. Reply with only: "OK_NEXO_READY"',
          },
          {
            role: 'user',
            content: 'Ping test',
          },
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errorJson: any = await res.json().catch(() => ({}));
      const errMsg = errorJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return {
        success: false,
        model: modelName,
        latencyMs,
        message: `فشل الاتصال بـ OpenAI: ${errMsg}`,
      };
    }

    const data: any = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      model: data.model || modelName,
      latencyMs,
      message: `تم الاتصال بنجاح مع محرك OpenAI (${data.model || modelName}) خلال ${latencyMs}ms. استجابة: ${reply.trim()}`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      model: modelName,
      latencyMs,
      message: `خطأ أثناء الاتصال بـ OpenAI: ${err.message || String(err)}`,
    };
  }
}

/**
 * Processes incoming customer message with OpenAI Chat / Responses API
 */
export async function processCustomerMessageWithOpenAI(params: {
  customer: Customer;
  incomingText: string;
  imageBase64?: string;
  imageMimeType?: string;
  adReferral?: { headline?: string; body?: string; sourceUrl?: string; campaign?: string };
}): Promise<{
  replyText: string;
  modelUsed: string;
  tokensEstimate: number;
  latencyMs: number;
  memoryUpdates?: Partial<Customer['memory']>;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'OPENAI_API_KEY_MISSING: متغير OPENAI_API_KEY غير موجود في البيئة. يرجى ضبطه بأمان في لوحة الأسرار (Secrets) بدون إرساله في المحادثة.'
    );
  }

  const settings = db.getSettings();
  const products = db.getProducts();
  const playbook = db.getPlaybook();
  const history = db.getMessages(params.customer.id).slice(-12);

  const catalogContext = buildCatalogPrompt(products);
  const activeRules = playbook
    .filter((r) => r.enabled)
    .map(
      (r) =>
        `- [قاعدة: ${r.title}] الهدف: ${r.salesObjective}. إرشادات: ${r.guidelines}. (خصم مسموح: ${
          r.discountAllowed ? r.maxDiscountPercentage + '%' : 'غير مصرح'
        })`
    )
    .join('\n');

  const customerMemoryContext = `
ذاكرة وسجل العميل الحالي:
- المعرّف: ${params.customer.id}
- الاسم: ${params.customer.name}
- اللغة المعتادة: ${params.customer.language}
- الاهتمامات السابقة: ${params.customer.memory?.interests?.join(', ') || 'لا توجد اهتمامات مسجلة بعد'}
- الاعتراضات أو المقارنات السابقة: ${params.customer.memory?.objections?.join(', ') || 'لا توجد'}
- الميزانية المذكورة: ${params.customer.memory?.budget || 'لم تذكر'}
- حقائق مثبتة عن العميل: ${params.customer.memory?.keyFacts?.join(', ') || 'لا توجد'}
- ملاحظات المشرف: ${params.customer.notes || params.customer.memory?.notes || 'لا توجد'}
${
  params.adReferral
    ? `- إحالة إعلان ترويجي نشط:
      * العنوان: ${params.adReferral.headline || 'غير محدد'}
      * المحتوى: ${params.adReferral.body || 'غير محدد'}
      * الرابط أو الحملة: ${params.adReferral.sourceUrl || params.adReferral.campaign || 'عام'}`
    : ''
}
`;

  const systemInstructions = `أنت المساعد الذكي لمبيعات متجر NEXO للتقنيات والملحقات الأصلية.
تتميز بالذكاء، والهدوء، والردود الإنسانية الطبيعية الذكية، وتجيب باقتضاب ولطافة دون مظهر الروبوتات الجامدة.

=== [1. شخصية وهوية المساعد] ===
${settings.personaPrompt || ''}

=== [2. أسلوب وطريقة الرد] ===
${settings.toneAndStylePrompt || ''}
نبرة الحوار: ${settings.salesTone}
مستوى الإيجاز: ${settings.responseLength === 'concise' ? 'مختصر ومباشر جداً، أجب فقط عن السؤال' : 'مفصل وغني بالقيمة ومزايا الاستخدام'}

=== [3. قواعد البيع والإقناع واستراتيجية القيمة] ===
${settings.salesAndPersuasionRules || ''}

=== [4. تعليمات خاصة بالمنتجات والأسعار الرسمية] ===
${settings.productSpecificInstructions || ''}

كتالوج منتجات NEXO الرسمي (مصدر الحقيقة الوحيد لجميع الأسعار والمواصفات):
${catalogContext}

=== [5. ممنوعات ومحاذير الرد الصارمة] ===
${settings.prohibitedResponsesPrompt || ''}

قواعد ودليل المبيعات (Playbook):
${activeRules}

${customerMemoryContext}

=== [توجيهات تشغيلية حاسمة وفورية] ===
1. إذا كانت رسالة الزبون الحالية مجرد تحية مثل "مرحبا" أو "السلام عليكم" أو "هلا" أو "שלום"، رد بتحية ترحيبية قصيرة فقط دون عرض أي منتجات أو أسعار مسبقاً.
2. إذا سأل الزبون "كم السعر؟" وكان المنتج معروفاً من سياق الحديث أو الصورة أو الإعلان، اذكر سعره الصحيح والدقيق فوراً من الكتالوج مع الضمان المرفق بإيجاز.
3. لا تختم ردك بسؤال إلحاح ميكانيكي مكرر مثل "بدك تطلب؟". أجب فقط عن سؤاله ودع الحديث يمضي بأريحية.
4. أبرز مميزات المنتج الحقيقية وقيمته مقابل السعر بأمانة تامة دون اختلاق أي معلومة.
5. رد بنفس لغة العميل: عبرية أو عربية.
6. إذا أرسل العميل صورة أو وردت إحالة إعلان، اعتمد عليها بدقة؛ وإذا لم تكن متوفرة، لا تدعِ استلامها.`;

  // Build messages array for OpenAI
  const apiMessages: any[] = [
    {
      role: 'system',
      content: systemInstructions,
    },
  ];

  // Add conversation history
  for (const m of history) {
    if (m.sender === 'customer') {
      apiMessages.push({
        role: 'user',
        content: m.text,
      });
    } else {
      apiMessages.push({
        role: 'assistant',
        content: m.text,
      });
    }
  }

  // Construct current user message (multimodal if image provided)
  const currentContent: any[] = [];
  if (params.imageBase64 && params.imageMimeType) {
    currentContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${params.imageMimeType};base64,${params.imageBase64}`,
      },
    });
  }

  currentContent.push({
    type: 'text',
    text: params.incomingText || 'مرحباً',
  });

  apiMessages.push({
    role: 'user',
    content: currentContent.length === 1 && currentContent[0].type === 'text' ? currentContent[0].text : currentContent,
  });

  const selectedModel = settings.modelOpenAI || 'gpt-4o';
  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: apiMessages,
      temperature: settings.temperature ?? 0.7,
      max_tokens: settings.maxTokens ?? 600,
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorJson: any = await response.json().catch(() => ({}));
    const errMsg = errorJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`OpenAI API Error: ${errMsg}`);
  }

  const data: any = await response.json();
  const replyText =
    data.choices?.[0]?.message?.content?.trim() || 'شكراً لتواصلك معنا في NEXO، كيف يمكنني مساعدتك؟';

  const tokensEstimate = data.usage?.total_tokens || Math.round(replyText.length / 4);

  // Extract memory insights if appropriate (e.g. interest in product or language)
  const memoryUpdates: Partial<Customer['memory']> = {};
  const lowerText = params.incomingText.toLowerCase();

  // Detect language hint
  if (/[\u0590-\u05FF]/.test(params.incomingText)) {
    memoryUpdates.preferredLanguage = 'he';
  } else if (/[\u0600-\u06FF]/.test(params.incomingText)) {
    memoryUpdates.preferredLanguage = 'ar';
  }

  // Detect interest in catalog products
  for (const p of products) {
    if (
      lowerText.includes(p.name.toLowerCase()) ||
      lowerText.includes(p.arabicName.toLowerCase()) ||
      lowerText.includes(p.hebrewName.toLowerCase()) ||
      lowerText.includes(p.sku.toLowerCase())
    ) {
      memoryUpdates.interests = [p.name];
      break;
    }
  }

  return {
    replyText,
    modelUsed: data.model || selectedModel,
    tokensEstimate,
    latencyMs,
    memoryUpdates: Object.keys(memoryUpdates).length > 0 ? memoryUpdates : undefined,
  };
}
