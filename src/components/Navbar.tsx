import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bell,
  User,
  Shield,
  LogOut,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface NavbarProps {
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab }) => {
  const { admin, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<any>(null);

  const fetchSettings = () => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#091122]/90 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-20">
      {/* Title & Engine indicator */}
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>نظام نكسو للمبيعات وإدارة محادثات واتساب</span>
        </h2>

        {settings && (
          <div className="hidden md:flex items-center gap-2 border border-slate-800 rounded-lg px-2.5 py-1 bg-slate-900/60 text-xs">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">محرك الذكاء:</span>
            <span
              className={`font-mono font-medium ${
                settings.provider === 'openai' ? 'text-teal-400' : 'text-blue-400'
              }`}
            >
              {settings.provider === 'openai'
                ? `OpenAI (${settings.modelOpenAI || 'gpt-4o'})`
                : `Gemini (${settings.modelGemini || 'gemini-2.5-flash'})`}
            </span>
            <span className="text-slate-600">|</span>
            <span
              className={`text-[11px] font-medium ${
                settings.autoReplyEnabled ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {settings.autoReplyEnabled ? '● الرد التلقائي مفعل' : '○ الرد التلقائي متوقف'}
            </span>
          </div>
        )}
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-3">
        {/* Language switch */}
        <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2.5 py-1 rounded-md transition ${
              language === 'ar' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            عربي
          </button>
          <button
            onClick={() => setLanguage('he')}
            className={`px-2.5 py-1 rounded-md transition ${
              language === 'he' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            עברית
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md transition ${
              language === 'en' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3 ps-2 border-s border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden lg:block text-start">
              <p className="text-xs font-semibold text-slate-200">{admin?.name || 'مدير النظام'}</p>
              <p className="text-[10px] text-slate-500 font-mono">مشرف معتمد</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="تسجيل الخروج"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
