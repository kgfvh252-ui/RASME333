import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';
import { Customer, Product, ChatMessage } from '../src/types/index.js';

function buildCatalogPrompt(products: Product[]): string {
  return products
    .map((p) => {
      const stockStatus = p.inStock ? `متوفر في المخزون (${p.stock} قطعة)` : 'نفد من المخزون';
      return `[المنتج: ${p.name}]
الاسم بالعربية: ${p.arabicName}
الاسم بالعبرية: ${p.hebrewName}
السعر الرسمي: ${p.price} ${p.currency} (السعر السابق: ${p.originalPrice || p.price} ${p.currency})
رمز المنتج (SKU): ${p.sku}
حالة التوفر: ${stockStatus}
الوصف: ${p.description}
أبرز المميزات:
${p.features.map((f) => `- ${f}`).join('\n')}
رابط الصورة: ${p.imageUrl}
-----------------------`;
    })
    .join('\n\n');
}

export async function processCustomerMessageWithGemini(params: {
  customer: Customer;
  incomingText: string;
  imageBase64?: string;
  imageMimeType?: string;
  adReferral?: { headline?: string; body?: string; sourceUrl?: string };
}): Promise<{
  replyText: string;
  modelUsed: string;
  tokensEstimate: number;
  memoryUpdates?: Partial<Customer['memory']>;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  const settings = db.getSettings();
  const products = db.getProducts();
  const playbook = db.getPlaybook();
  const history = db.getMessages(params.customer.id).slice(-10);

  const catalogContext = buildCatalogPrompt(products);
  const activeRules = playbook
    .filter((r) => r.enabled)
    .map((r) => `- [${r.title}] الهدف: ${r.salesObjective}. التوجيه: ${r.guidelines}. (خصم مسموح: ${r.discountAllowed ? r.maxDiscountPercentage + '%' : 'لا'})`)
    .join('\n');

  const customerMemoryContext = `
معلومات وذاكرة العميل المحفوظة:
- الاسم: ${params.customer.name}
- اللغة المفضلة: ${params.customer.language}
- اهتمامات سابقة: ${params.customer.memory?.interests?.join(', ') || 'لا يوجد'}
- اعتراضات سابقة: ${params.customer.memory?.objections?.join(', ') || 'لا يوجد'}
- الميزانية المذكورة: ${params.customer.memory?.budget || 'غير محددة'}
- حقائق مثبتة: ${params.customer.memory?.keyFacts?.join(', ') || 'لا يوجد'}
- ملاحظات عامة: ${params.customer.notes || params.customer.memory?.notes || 'لا يوجد'}
${params.adReferral ? `- إحالة إعلان ترويجي: عنوان: ${params.adReferral.headline || ''} | تفاصيل: ${params.adReferral.body || ''}` : ''}
`;

  const conversationHistoryContext = history
    .map((m) => `${m.sender === 'customer' ? 'العميل' : 'المبيعات'}: ${m.text}`)
    .join('\n');

  const systemInstruction = `أنت المساعد الذكي لمبيعات متجر NEXO للتقنيات والملحقات الأصلية.
تتميز بالذكاء، والهدوء، والردود الإنسانية الطبيعية الذكية (قريب جداً من أسلوب ChatGPT الطبيعي المرن)، وتجيب باقتضاب ولطافة دون مظهر الروبوتات الجامدة.

=== [1. شخصية وهوية المساعد] ===
${settings.personaPrompt || ''}

=== [2. أسلوب وطريقة الرد] ===
${settings.toneAndStylePrompt || ''}
نبرة الحوار المحددة: ${settings.salesTone}
مستوى الإيجاز: ${settings.responseLength === 'concise' ? 'مختصر ومباشر جداً، أجب فقط عن سؤال الزبون' : 'مفصل وغني بالفوائد'}

=== [3. قواعد البيع والإقناع واستراتيجية القيمة] ===
${settings.salesAndPersuasionRules || ''}

=== [4. تعليمات خاصة بالمنتجات والأسعار الرسمية] ===
${settings.productSpecificInstructions || ''}

كتالوج المنتجات الرسمي (مصدر الحقيقة الوحيد لجميع الأسعار والمواصفات):
${catalogContext}

=== [5. ممنوعات ومحاذير الرد الصارمة] ===
${settings.prohibitedResponsesPrompt || ''}

دليل وقواعد المبيعات الإضافية (Playbook):
${activeRules}

${customerMemoryContext}

تاريخ المحادثة السابقة:
${conversationHistoryContext}

=== [توجيهات تشغيلية حاسمة وفورية] ===
1. إذا كانت رسالة الزبون الحالية مجرد تحية مثل "مرحبا" أو "السلام عليكم" أو "هلا" أو "שלום"، رد بتحية ترحيبية قصيرة ولطيفة فقط بدون سرد منتجات أو أسعار أو عروض.
2. إذا سأل الزبون "كم السعر؟" أو ما شابه وكان المنتج معروفاً من سياق الحديث أو الصورة أو إعلان فيسبوك، اذكر سعره الصحيح والدقيق فوراً من الكتالوج بعملة الشيكل (ILS) مع الضمان المرفق بإيجاز، دون تشتيت.
3. لا تختم ردك بسؤال إلحاح ميكانيكي مكرر مثل "بدك تطلب؟" أو "تحب أحجزلك؟" في كل رسالة. أجب عن سؤاله ودع الحديث يمضي بأريحية.
4. أبرز مميزات المنتج الحقيقية وقيمته مقابل السعر بأمانة تامة دون اختلاق أي معلومة أو إخفاء أي تفصيل مهم.
5. رد بنفس لغة العميل: إذا كتب بالعبرية رد بالعبرية، وإذا كتب بالعربية رد بالعربية.
6. إذا أرسل صورة أو توفرت بيانات إحالة إعلان، اعتمد عليها بدقة؛ وإذا لم تكن متوفرة، لا تدعِ استلامها.`;

  const contents: any[] = [];

  if (params.imageBase64 && params.imageMimeType) {
    contents.push({
      inlineData: {
        data: params.imageBase64,
        mimeType: params.imageMimeType,
      },
    });
  }

  contents.push({
    text: params.incomingText || 'مرحباً',
  });

  let response: any;
  const targetModel = settings.modelGemini || 'gemini-3.8-flash';

  try {
    response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
        temperature: settings.temperature ?? 0.7,
        maxOutputTokens: settings.maxTokens ?? 600,
      },
    });
  } catch (err: any) {
    // If transient 503 spike, retry once with gemini-flash-latest
    if (err?.message?.includes('503') || err?.message?.includes('high demand')) {
      await new Promise((r) => setTimeout(r, 1200));
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
        config: {
          systemInstruction,
          temperature: settings.temperature ?? 0.7,
          maxOutputTokens: settings.maxTokens ?? 600,
        },
      });
    } else {
      throw err;
    }
  }

  const replyText = response.text?.trim() || 'شكراً لتواصلك معنا، كيف يمكنني مساعدتك اليوم؟';

  // Extract memory updates from conversation
  const memoryUpdates: Partial<Customer['memory']> = {};
  const lowerText = params.incomingText.toLowerCase();

  if (/[\u0590-\u05FF]/.test(params.incomingText)) {
    memoryUpdates.preferredLanguage = 'he';
  } else if (/[\u0600-\u06FF]/.test(params.incomingText)) {
    memoryUpdates.preferredLanguage = 'ar';
  }

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
    modelUsed: targetModel,
    tokensEstimate: replyText.length / 4,
    memoryUpdates: Object.keys(memoryUpdates).length > 0 ? memoryUpdates : undefined,
  };
}
