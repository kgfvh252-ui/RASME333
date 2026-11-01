import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext.js';

import { WarningBanner } from './components/WarningBanner.js';
import { Sidebar } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';

import { DashboardOverview } from './pages/DashboardOverview.js';
import { WhatsAppConnect } from './pages/WhatsAppConnect.js';
import { Inbox } from './pages/Inbox.js';
import { Products } from './pages/Products.js';
import { Orders } from './pages/Orders.js';
import { Playbook } from './pages/Playbook.js';
import { FollowUps } from './pages/FollowUps.js';
import { Analytics } from './pages/Analytics.js';
import { Simulator } from './pages/Simulator.js';
import { Diagnostics } from './pages/Diagnostics.js';
import { Settings } from './pages/Settings.js';
import { DeploymentGuide } from './pages/DeploymentGuide.js';
import { Login } from './pages/Login.js';

const MainLayout: React.FC = () => {
  const { admin, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        const unread = data.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(unread);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (admin) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 10000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c18] flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span>جارٍ التحقق من جلسة المشرف...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 flex flex-col font-sans">
      {/* Prominent Legal & Technical Disclaimer Banner */}
      <WarningBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          unreadCount={unreadCount}
        />

        {/* Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Navbar currentTab={currentTab} />

          <main className="flex-1 p-6">
            {currentTab === 'dashboard' && <DashboardOverview onNavigate={setCurrentTab} />}
            {currentTab === 'whatsapp_connect' && (
              <WhatsAppConnect onNavigateToDiagnostics={() => setCurrentTab('diagnostics')} />
            )}
            {currentTab === 'inbox' && <Inbox />}
            {currentTab === 'products' && <Products />}
            {currentTab === 'orders' && <Orders />}
            {currentTab === 'playbook' && <Playbook />}
            {currentTab === 'follow_ups' && <FollowUps />}
            {currentTab === 'analytics' && <Analytics />}
            {currentTab === 'simulator' && <Simulator />}
            {currentTab === 'diagnostics' && <Diagnostics />}
            {currentTab === 'deployment' && <DeploymentGuide />}
            {currentTab === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <WebSocketProvider>
          <MainLayout />
        </WebSocketProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
