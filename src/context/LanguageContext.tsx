import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'he' | 'en';

interface LanguageContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    dashboard: 'لوحة التحكم',
    inbox: 'صندوق المحادثات',
    whatsapp: 'اتصال واتساب',
    products: 'كتالوج المنتجات',
    orders: 'إدارة الطلبات',
    playbook: 'دليل وقواعد البيع',
    followups: 'المتابعات والمهام',
    analytics: 'التقارير والمبيعات',
    simulator: 'محاكي الذكاء الاصطناعي',
    diagnostics: 'فحص النظام والتشخيص',
    settings: 'الإعدادات العامة',
    deployment: 'دليل النشر والاستضافة',
    connected: 'متصل',
    disconnected: 'غير متصل',
    connecting: 'جارٍ الاتصال',
    scan_qr: 'امسح رمز الاستجابة السريعة QR',
  },
  he: {
    dashboard: 'לוח בקרה',
    inbox: 'תיבת הודעות',
    whatsapp: 'חיבור וואטסאפ',
    products: 'קטלוג מוצרים',
    orders: 'ניהול הזמנות',
    playbook: 'פלייבוק מכירות',
    followups: 'משימות מעקב',
    analytics: 'אנליטיקה ודוחות',
    simulator: 'סימולטור AI',
    diagnostics: 'אבחון מערכת',
    settings: 'הגדרות',
    deployment: 'מדריך הפצה',
    connected: 'מחובר',
    disconnected: 'מנותק',
    connecting: 'מתחבר',
    scan_qr: 'סרוק קוד QR',
  },
  en: {
    dashboard: 'Dashboard',
    inbox: 'Inbox',
    whatsapp: 'WhatsApp Connect',
    products: 'Products Catalog',
    orders: 'Orders Management',
    playbook: 'Sales Playbook',
    followups: 'Follow-ups',
    analytics: 'Analytics',
    simulator: 'AI Simulator',
    diagnostics: 'Diagnostics',
    settings: 'Settings',
    deployment: 'Deployment Guide',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting',
    scan_qr: 'Scan QR Code',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  direction: 'rtl',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
  };

  const t = (key: string) => {
    return translations[language]?.[key] || key;
  };

  const direction = language === 'en' ? 'ltr' : 'rtl';

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
