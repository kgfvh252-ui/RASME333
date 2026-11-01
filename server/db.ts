import fs from 'fs';
import path from 'path';
import {
  Customer,
  ChatMessage,
  Product,
  Order,
  PlaybookRule,
  AiSettings,
  AuditLog,
  FollowUpTask,
  AdminUser,
} from '../src/types/index.js';

interface DatabaseSchema {
  customers: Customer[];
  messages: Record<string, ChatMessage[]>;
  products: Product[];
  orders: Order[];
  playbook: PlaybookRule[];
  followUps: FollowUpTask[];
  settings: AiSettings;
  auditLogs: AuditLog[];
  admin: AdminUser;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexo-db.json');

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'NEXO Pro Sound X1 Wireless ANC Headphones',
    arabicName: 'سماعات نكسو برو ساوند X1 اللاسلكية مع عزل الضوضاء النشط',
    hebrewName: 'אוזניות אלחוטיות NEXO Pro Sound X1 עם ביטול רעשים אקטיבי',
    description: 'سماعات رأس لاسلكية متميزة بعزل ضوضاء فعال حتى 40dB، صوت عالي الدقة Hi-Res، بطارية تدوم 45 ساعة، وشحن سريع خلال 10 دقائق.',
    price: 349,
    originalPrice: 449,
    currency: 'ILS',
    sku: 'NX-SND-X1',
    stock: 28,
    category: 'Audio',
    features: [
      'عزل ضوضاء نشط هجين ANC يصل إلى 40dB',
      'عمر بطارية يصل إلى 45 ساعة تشغيل متواصل',
      'دعم ترميز LDAC و AAC لصوت عالي الدقة',
      'ميكروفونات متعددة بتقنية الذكاء الاصطناعي لمكالمات فائقة الوضوح',
      'اتصال بجهازين في نفس الوقت Bluetooth 5.3',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-002',
    name: 'NEXO Ultra Watch 3 AMOLED Smartwatch',
    arabicName: 'ساعة نكسو الذكية ألترا 3 بشاشة أموليد مقاومة للماء',
    hebrewName: 'שעון חכם NEXO Ultra Watch 3 עם מסך AMOLED ועמידות במים',
    description: 'ساعة ذكية فاخرة بإطار من التيتانيوم وشاشة AMOLED سطوع 1200nits، مراقبة نبضات القلب، تخطيط القلب ECG، قياس الأكسجين، GPS مزدوج، وبطارية 14 يوماً.',
    price: 499,
    originalPrice: 620,
    currency: 'ILS',
    sku: 'NX-WCH-U3',
    stock: 19,
    category: 'Wearables',
    features: [
      'شاشة 1.43 بوصة AMOLED فائقة السطوع تعمل دائماً Always-On',
      'هيكل متين من سبائك التيتانيوم ومقاومة ماء 5ATM للسباحة',
      'نظام GPS ثنائي التردد لتتبع المسارات والرياضة بدقة متناهية',
      'أكثر من 120 وضعاً رياضياً ومتابعة النوم المتقدمة',
      'إجراء واستقبال المكالمات بوضوح تام عبر مكبر صوت وميكروفون مدمجين',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-003',
    name: 'NEXO Pure Air Mini Smart Purifier',
    arabicName: 'جهاز تنقية الهواء الذكي المحمول نكسو بيور إير ميني',
    hebrewName: 'מטהר אוויר חכם וקומפקטי NEXO Pure Air Mini',
    description: 'منقي هواء مدمج ذكي بفلتر HEPA H13 حقيقي يزيل 99.97% من الجسيمات الدقيقة والدخان والروائح المزعجة، مثالي للمكتب وغرفة النوم والسيارة.',
    price: 219,
    originalPrice: 280,
    currency: 'ILS',
    sku: 'NX-AIR-M1',
    stock: 42,
    category: 'Home & Office',
    features: [
      'فلتر HEPA H13 أصلي من 3 مراحل تنقية',
      'مستشعر ذكي لمؤشر جودة الهواء مع إضاءة ملونة تفاعلية',
      'مستوى ضوضاء فائق الهدوء 22dB لوضع النوم الهادئ',
      'منفذ شحن USB-C واستهلاك طاقة منخفض جداً',
      'تغطية مساحة تصل إلى 20 متراً مربعاً',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-004',
    name: 'NEXO Turbo Mag 3-in-1 Fast Wireless Charger',
    arabicName: 'قاعدة شحن لاسلكية سريعة مغناطيسية 3 في 1 نكسو توربو ماغ',
    hebrewName: 'עמדת טעינה אלחוטית מהירה 3 ב-1 NEXO Turbo Mag',
    description: 'منصة شحن مغناطيسية قابلة للطي تشحن الهاتف والساعة وسماعات الأذن في وقت واحد بقوة تصل إلى 15W مع حماية متكاملة من الحرارة والجهد الزائد.',
    price: 169,
    originalPrice: 220,
    currency: 'ILS',
    sku: 'NX-CHG-M3',
    stock: 55,
    category: 'Accessories',
    features: [
      'شحن متزامن لـ 3 أجهزة (هاتف + ساعة + سماعات)',
      'محاذاة مغناطيسية قوية MagSafe متوافقة مع أجهزة آيفون وسامسونج الحديثة',
      'تصميم مدمج قابل للطي مناسب للسفر والرحلات',
      'حماية مدمجة ضد ارتفاع درجة الحرارة والتيار الزائد',
      'إضاءة محيطية لطيفة يمكن إيقافها بلمسة واحدة',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b14e32452e?w=800&auto=format&fit=crop&q=80',
    inStock: true,
  },
];

const INITIAL_PLAYBOOK: PlaybookRule[] = [
  {
    id: 'rule-01',
    title: 'الترحيب الأولي وبناء الثقة',
    triggerType: 'greeting',
    keywords: ['مرحبا', 'السلام عليكم', 'سلام', 'أهلا', 'שלום', 'היי', 'בוקר טוב', 'ערב טוב'],
    salesObjective: 'الرد باحترافية، الترحيب الدافئ، والاستماع فوراً لما يبحث عنه العميل دون إطالة أو ضغط.',
    guidelines: 'رد بترحيب أنيق ومختصر، واسأل باحترام عن المنتج أو الخدمة التي يود الاستفسار عنها.',
    discountAllowed: false,
    maxDiscountPercentage: 0,
    enabled: true,
  },
  {
    id: 'rule-02',
    title: 'الاستفسار عن الأسعار والعروض',
    triggerType: 'pricing',
    keywords: ['سعر', 'كام', 'كم السعر', 'بكام', 'تكلفة', 'מחיר', 'כמה עולה', 'עלות', 'מבצע'],
    salesObjective: 'تقديم السعر الرسمي بوضوح من الكتالوج مع ذكر القيمة والضمان المرفق.',
    guidelines: 'اذكر السعر بدقة بعملة الشيكل (ILS) أو العملة المناسبة، اذكر الضمان والشحن السريع وميزة رئيسية تجعل السعر فرصة ممتازة.',
    discountAllowed: true,
    maxDiscountPercentage: 10,
    enabled: true,
  },
  {
    id: 'rule-03',
    title: 'التعامل مع التردد أو اعتراض السعر مرتفع',
    triggerType: 'objection',
    keywords: ['غالي', 'السعر مرتفع', 'مكلف', 'في أرخص', 'יקר', 'יקר מדי', 'יש הנחה', 'אפשר הנחה'],
    salesObjective: 'توضيح القيمة العالية، الجودة، وفترة الضمان، مع إمكانية عرض كود خصم ترحيبي 10% إذا كان العميل جاداً.',
    guidelines: 'ركز على متانة المنتج وعمر البطارية والضمان المحلي لـ 12 شهراً، ويمكنك تقديم خصم فوري 10% لإتمام الطلب اليوم.',
    discountAllowed: true,
    maxDiscountPercentage: 15,
    enabled: true,
  },
  {
    id: 'rule-04',
    title: 'إحالات إعلانات فيسبوك وإنستغرام',
    triggerType: 'ad_referral',
    keywords: ['شفت الإعلان', 'إعلان فيسبوك', 'المنشور', 'من الإعلان', 'ראיתי פרסומת', 'פייסבוק'],
    salesObjective: 'تحديد المنتج المعلن عنه وتقديم تفاصيله الدقيقة مع تأكيد العرض الخاص بحملة الإعلان.',
    guidelines: 'إذا وردت بيانات الإعلان أو سياق المنتج، اربط العميل بالمنتج مباشرة واشرح تفاصيل العرض دون تكرار أسئلة بديهية.',
    discountAllowed: true,
    maxDiscountPercentage: 10,
    enabled: true,
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-972501234567',
    phoneNumber: '972501234567',
    name: 'أحمد الخطيب',
    tags: ['عميل مهتم', 'مهتم بـ X1'],
    notes: 'استفسر عن عزل الضوضاء وعمر البطارية، يفضل الشحن السريع.',
    stage: 'negotiation',
    language: 'ar',
    unreadCount: 0,
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    totalSpent: 0,
    ordersCount: 0,
    memory: {
      interests: ['سماعات رأس', 'عزل الضوضاء', 'مكالمات العمل'],
      objections: ['المقارنة مع سوني وبوز'],
      budget: '350 ILS',
      preferredLanguage: 'ar',
      notes: 'يعمل عن بعد ويبحث عن سماعة ممتازة لعزل الضجيج.',
      keyFacts: ['مقيم في القدس', 'يستخدم هاتف أندرويد ولابتوب ويندوز'],
    },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust-972549876543',
    phoneNumber: '972549876543',
    name: 'רוני כהן',
    tags: ['לקוח מתעניין', 'ספורט'],
    notes: 'התעניין ב-NEXO Ultra Watch 3 לענפי ריצה ושחייה.',
    stage: 'contacted',
    language: 'he',
    unreadCount: 1,
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    totalSpent: 0,
    ordersCount: 0,
    memory: {
      interests: ['NEXO Ultra Watch 3', 'שחייה', 'ריצה'],
      objections: [],
      budget: '500 ILS',
      preferredLanguage: 'he',
      notes: 'רץ מרתון שמתאמן מספר פעמים בשבוע.',
      keyFacts: ['מתגורר בתל אביב', 'מעוניין בעמידות למים 5ATM'],
    },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'cust-972501234567': [
    {
      id: 'msg-001',
      customerId: 'cust-972501234567',
      sender: 'customer',
      text: 'مرحباً، هل سماعة نكسو X1 تعزل صوت الزحمة ومكاتب العمل المفتوحة بشكل ممتاز؟',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-002',
      customerId: 'cust-972501234567',
      sender: 'ai',
      text: 'أهلاً بك أخي أحمد! نعم بالتأكيد، سماعات NEXO Pro Sound X1 مزودة بتقنية العزل النشط الهجين (Hybrid ANC) بعمق يصل إلى 40dB، وهي مصممة خصيصاً لإلغاء ضوضاء المكاتب والأصوات المحيطة مع الحفاظ على صفاء مكالماتك بفضل 4 ميكروفونات ذكية. هل ترغب في معرفة تفاصيل أكثر عنها؟',
      timestamp: new Date(Date.now() - 7100000).toISOString(),
      status: 'read',
      aiProvider: 'gemini',
    },
    {
      id: 'msg-003',
      customerId: 'cust-972501234567',
      sender: 'customer',
      text: 'ممتاز، وكم سعرها حالياً مع التوصيل؟',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-004',
      customerId: 'cust-972501234567',
      sender: 'ai',
      text: 'سعرها حالياً في العرض الخاص 349 شيكل بدلاً من 449 شيكل، شامل التوصيل السريع وضمان معتمد لمدة 12 شهراً.',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      status: 'read',
      aiProvider: 'gemini',
    },
  ],
  'cust-972549876543': [
    {
      id: 'msg-005',
      customerId: 'cust-972549876543',
      sender: 'customer',
      text: 'שלום, האם ה-Ultra Watch 3 מתאים לשחייה בבריכה ובים?',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'delivered',
    },
  ],
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'NX-98214',
    customerId: 'cust-972501234567',
    customerName: 'أحمد الخطيب',
    customerPhone: '972501234567',
    items: [
      {
        productId: 'prod-001',
        productName: 'NEXO Pro Sound X1 Wireless ANC Headphones',
        quantity: 1,
        price: 349,
        totalPrice: 349,
      },
    ],
    totalAmount: 349,
    currency: 'ILS',
    status: 'confirmed',
    shippingAddress: 'شارع صلاح الدين، القدس',
    city: 'القدس',
    paymentMethod: 'الدفع عند الاستلام',
    notes: 'يرجى الاتصال قبل التسليم بنصف ساعة.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const INITIAL_SETTINGS: AiSettings = {
  provider: 'gemini', // Gemini is the primary engine as requested
  autoReplyEnabled: false, // Default is disabled so live replies are not auto-triggered without approval
  modelGemini: 'gemini-3.8-flash',
  modelOpenAI: 'gpt-4o',
  salesTone: 'consultative',
  responseLength: 'concise',
  languages: ['ar', 'he', 'en'],
  systemPrompt: `أنت موظف مبيعات واستشارات خبير ومحترف في متجر NEXO للتقنية الفاخرة.
تتحدث باللغة العربية بأسلوب راقٍ، مهذب، ذكي، ومباشر، وتجيد الرد باللغة العبرية والإنجليزية إذا خاطبك العميل بهما.
مهمتك تقديم معلومات دقيقة وصادقة عن المنتجات والأسعار والمواصفات من الكتالوج المتوفر فقط.`,
  personaPrompt: `أنت مستشار وموظف مبيعات تقني خبير وودود في متجر NEXO للتقنيات والملحقات الأصلية.
تتميز بالذكاء، والهدوء، وسرعة البديهة، والأسلوب الإنساني الطبيعي المشابه لأفضل محاوري المبيعات (قريب جداً من أسلوب ChatGPT الطبيعي المرن).
لست روبوتاً يكرر نصوصاً محفوظة، بل تفهم احتياج العميل ومزاجه وتتفاعل معه بلباقة وعفوية.
تتقن التحدث باللغة العربية بلهجة بيضاء مهذبة وباللغة العبرية بطلاقة تامة بحسب لغة الزبون.`,
  toneAndStylePrompt: `- الردود يجب أن تكون قصيرة، طبيعية، ومركزة جداً بدون حشو أو مقدمات إنشائية طويلة.
- أجب عن سؤال العميل تحديداً ولا تشتت انتباهه بمواضيع جانبية لم يسأل عنها.
- إذا كانت رسالة الزبون مجرد تحية مثل "مرحبا" أو "السلام عليكم" أو "שלום"، رد بتحية ترحيبية دافئة وقصيرة فقط مثل: "أهلاً وسهلاً بك! كيف أقدر أساعدك اليوم؟" دون عرض أي منتجات أو أسعار مسبقاً.
- لا تضع أبداً سؤال بيع ميكانيكي أو ملح مثل "بدك تطلب؟" أو "تحب أسجلك طلب هسا؟" في نهاية كل رد. دع المحادثة تسير بسلاسة، ولا تسأل عن الطلب إلا إذا طلب الزبون الشراء صراحة أو وصل الحوار لخطوة العنوان والشحن.`,
  salesAndPersuasionRules: `- ركز على المنفعة العملية التي يحصل عليها العميل (Value Proposition) وليس مجرد سرد المواصفات الجافة.
- اربط السعر بالجودة: بين أن المنتج استثمار ممتاز بفضل عمر البطارية، متانة التصنيع، وجودة الصوت والشاشات، والضمان المحلي لـ 12 شهراً والتوصيل السريع.
- عند الاستفسار عن السعر ("كم السعر؟"): إذا كان المنتج معروفاً من سياق المحادثة أو الصورة المرسلة أو إعلان فيسبوك، أعطِ السعر المباشر والدقيق فوراً من الكتالوج بعملة الشيكل (ILS) مع ذكر ميزة الضمان المرفق بإيجاز.
- في حال تردد العميل من السعر، استمع لاعتراضه باحترام، ووضح سبب تميز المنتج عن البدائل الرخيصة، ويمكنك تقديم كود خصم بنسبة 10% إذا كان العميل جاداً في الشراء.
- احترم ذاكرة العميل ولا تعد سؤاله عن شيء ذكره سابقاً (مثل مدينته أو نوع هاتفه).`,
  productSpecificInstructions: `- سماعات NEXO Pro Sound X1: أبرز قوة عزل الضوضاء الهجين 40dB، والبطارية الهائلة 45 ساعة، والشحن السريع (10 دقائق تعطي 5 ساعات)، ونقاء المكالمات. السعر 349 شيكل بدلاً من 449.
- ساعة NEXO Ultra Watch 3: إطار تيتانيوم فاخر، شاشة AMOLED ساطعة Always-On، مقاومة ماء حقيقية 5ATM للسباحة، بطارية 14 يوماً ومكالمات واضحة. السعر 499 شيكل.
- منقي الهواء Pure Air Mini: فلتر HEPA H13 حقيقي يزيل 99.97% من الروائح والدخان، فائق الهدوء 22dB لغرف النوم والمكاتب والسيارة. السعر 219 شيكل.
- شاحن Turbo Mag 3-in-1: يشحن الهاتف والساعة وسماعات الأذن معاً، ماج سيف قوي قابل للطي، حماية ذكية من الحرارة. السعر 169 شيكل.
- اعتمد دائماً على أسعار ومواصفات الكتالوج الرسمي ولا تذكر منتجات غير موجودة.`,
  prohibitedResponsesPrompt: `- ممنوع منعاً باتاً تكرار سؤال "بدك تطلب؟" أو "نثبتلك طلب؟" في كل رسالة.
- ممنوع عرض أو سرد المنتجات إذا قال الزبون "مرحبا" أو ألقى تحية فقط.
- ممنوع اختلاق أي مواصفات أو مزايا أو أسعار أو هدايا غير موجودة في الكتالوج الرسمي.
- ممنوع إخفاء القيود المهمة (مثلاً إذا نفد المنتج من المخزون، يجب إخباره بصدق وأمانة).
- ممنوع الإصرار أو الإلحاح على الزبون إذا كان في مرحلة الاستفسار والتفكير.
- ممنوع الرد بلغة تخالف لغة العميل (إذا تحدث بالعبرية رد بالعبرية، وإذا تحدث بالعربية رد بالعربية).
- ممنوع الادعاء باستلام صورة أو إعلان فيسبوك إذا لم تكن مرفقة فعلياً بالرسالة.`,
  temperature: 0.7,
  maxTokens: 600,
  openaiReasoningEffort: 'low',
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all required fields exist
        if (!this.data.products || this.data.products.length === 0) {
          this.data.products = INITIAL_PRODUCTS;
        }
        if (!this.data.customers) this.data.customers = INITIAL_CUSTOMERS;
        if (!this.data.messages) this.data.messages = INITIAL_MESSAGES;
        if (!this.data.orders) this.data.orders = INITIAL_ORDERS;
        if (!this.data.playbook) this.data.playbook = INITIAL_PLAYBOOK;
        if (!this.data.followUps) this.data.followUps = [];
        if (!this.data.auditLogs) this.data.auditLogs = [];
        if (!this.data.settings) {
          this.data.settings = INITIAL_SETTINGS;
        } else {
          // ensure modelOpenAI is set if legacy settings
          if (!this.data.settings.modelOpenAI) {
            this.data.settings.modelOpenAI = 'gpt-4o';
          }
          if (!this.data.settings.modelGemini) {
            this.data.settings.modelGemini = 'gemini-3.8-flash';
          }
          if (!this.data.settings.provider) {
            this.data.settings.provider = 'gemini';
          }
          // ensure new instructions are present
          if (!this.data.settings.personaPrompt) {
            this.data.settings.personaPrompt = INITIAL_SETTINGS.personaPrompt;
          }
          if (!this.data.settings.toneAndStylePrompt) {
            this.data.settings.toneAndStylePrompt = INITIAL_SETTINGS.toneAndStylePrompt;
          }
          if (!this.data.settings.salesAndPersuasionRules) {
            this.data.settings.salesAndPersuasionRules = INITIAL_SETTINGS.salesAndPersuasionRules;
          }
          if (!this.data.settings.productSpecificInstructions) {
            this.data.settings.productSpecificInstructions = INITIAL_SETTINGS.productSpecificInstructions;
          }
          if (!this.data.settings.prohibitedResponsesPrompt) {
            this.data.settings.prohibitedResponsesPrompt = INITIAL_SETTINGS.prohibitedResponsesPrompt;
          }
        }
      } catch (err) {
        console.error('Error loading database, resetting to default seeds:', err);
        this.data = this.createDefaultData();
        this.save();
      }
    } else {
      this.data = this.createDefaultData();
      this.save();
    }
  }

  private createDefaultData(): DatabaseSchema {
    return {
      customers: INITIAL_CUSTOMERS,
      messages: INITIAL_MESSAGES,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      playbook: INITIAL_PLAYBOOK,
      followUps: [],
      settings: INITIAL_SETTINGS,
      auditLogs: [
        {
          id: 'log-001',
          action: 'SYSTEM_INITIALIZED',
          details: 'تم بدء نظام NEXO AI Sales CRM مع محرك Gemini ودعم OpenAI',
          performedBy: 'system',
          timestamp: new Date().toISOString(),
        },
      ],
      admin: {
        id: 'admin-001',
        username: 'admin',
        name: 'مدير المبيعات',
        role: 'admin',
      },
    };
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database to disk:', e);
    }
  }

  // Customers
  public getCustomers(): Customer[] {
    return [...this.data.customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  public getCustomerByPhone(phone: string): Customer | undefined {
    const cleanPhone = phone.replace(/\D/g, '');
    return this.data.customers.find((c) => c.phoneNumber.replace(/\D/g, '') === cleanPhone);
  }

  public saveCustomer(customer: Customer): void {
    const idx = this.data.customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      this.data.customers[idx] = customer;
    } else {
      this.data.customers.unshift(customer);
    }
    this.save();
  }

  public updateCustomerMemory(customerId: string, memoryUpdates: Partial<Customer['memory']>): void {
    const customer = this.getCustomerById(customerId);
    if (customer) {
      customer.memory = {
        ...customer.memory,
        ...memoryUpdates,
        interests: Array.from(new Set([...customer.memory.interests, ...(memoryUpdates.interests || [])])),
        objections: Array.from(new Set([...customer.memory.objections, ...(memoryUpdates.objections || [])])),
        keyFacts: Array.from(new Set([...customer.memory.keyFacts, ...(memoryUpdates.keyFacts || [])])),
      };
      this.saveCustomer(customer);
    }
  }

  // Messages
  public getMessages(customerId: string): ChatMessage[] {
    return this.data.messages[customerId] || [];
  }

  public addMessage(customerId: string, message: ChatMessage): void {
    if (!this.data.messages[customerId]) {
      this.data.messages[customerId] = [];
    }
    this.data.messages[customerId].push(message);

    // Update customer lastMessageAt
    const customer = this.getCustomerById(customerId);
    if (customer) {
      customer.lastMessageAt = message.timestamp;
      if (message.sender === 'customer') {
        customer.unreadCount = (customer.unreadCount || 0) + 1;
      }
      this.saveCustomer(customer);
    }

    this.save();
  }

  public markCustomerMessagesRead(customerId: string): void {
    const customer = this.getCustomerById(customerId);
    if (customer) {
      customer.unreadCount = 0;
      this.saveCustomer(customer);
    }
  }

  // Products
  public getProducts(): Product[] {
    return [...this.data.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public saveProduct(product: Product): void {
    const idx = this.data.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = product;
    } else {
      this.data.products.push(product);
    }
    this.save();
  }

  // Orders
  public getOrders(): Order[] {
    return [...this.data.orders];
  }

  public saveOrder(order: Order): void {
    const idx = this.data.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.data.orders[idx] = order;
    } else {
      this.data.orders.unshift(order);
    }
    this.save();
  }

  // Playbook
  public getPlaybook(): PlaybookRule[] {
    return [...this.data.playbook];
  }

  public savePlaybookRule(rule: PlaybookRule): void {
    const idx = this.data.playbook.findIndex((r) => r.id === rule.id);
    if (idx >= 0) {
      this.data.playbook[idx] = rule;
    } else {
      this.data.playbook.push(rule);
    }
    this.save();
  }

  // Follow Ups
  public getFollowUps(): FollowUpTask[] {
    return [...(this.data.followUps || [])];
  }

  public saveFollowUp(task: FollowUpTask): void {
    if (!this.data.followUps) this.data.followUps = [];
    const idx = this.data.followUps.findIndex((f) => f.id === task.id);
    if (idx >= 0) {
      this.data.followUps[idx] = task;
    } else {
      this.data.followUps.unshift(task);
    }
    this.save();
  }

  // Settings
  public getSettings(): AiSettings {
    return { ...this.data.settings };
  }

  public updateSettings(settings: Partial<AiSettings>): AiSettings {
    this.data.settings = {
      ...this.data.settings,
      ...settings,
    };
    this.save();
    return this.getSettings();
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return [...(this.data.auditLogs || [])];
  }

  public addAuditLog(action: string, details: string, performedBy = 'system'): void {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      details,
      performedBy,
      timestamp: new Date().toISOString(),
    });
    // Keep max 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
  }

  // Admin
  public getAdmin(): AdminUser {
    return { ...this.data.admin };
  }
}

export const db = new DatabaseManager();
