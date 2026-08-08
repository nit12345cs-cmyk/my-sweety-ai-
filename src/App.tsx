import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatModule } from './components/ChatModule';
import { WebsiteModule } from './components/WebsiteModule';
import { VoiceModule } from './components/VoiceModule';
import { AdminModule } from './components/AdminModule';
import { FooterBar } from './components/FooterBar';
import { LoginView } from './components/LoginView';
import { ModuleType, LanguageCode, ThemeType } from './types';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('chat');
  const [theme, setTheme] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem('swatea_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('swatea_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      return (localStorage.getItem('swatea_language') as LanguageCode) || 'en';
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('swatea_language', newLang);
    } catch (e) {
      console.error(e);
    }
  };
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('swatea_user_email') || 'user@swatea.ai';
    } catch {
      return 'user@swatea.ai';
    }
  });

  const ADMIN_EMAILS = ['sathishkumar0076767@gmail.com', 'admin@swatea.ai'];
  const isAdmin = Boolean(currentUserEmail && ADMIN_EMAILS.includes(currentUserEmail.toLowerCase().trim()));

  useEffect(() => {
    if (!isAdmin && activeModule === 'admin') {
      setActiveModule('chat');
    }
  }, [isAdmin, activeModule]);

  const handleLogin = (email: string) => {
    try {
      localStorage.setItem('swatea_user_email', email);
    } catch (e) {
      console.error(e);
    }
    setCurrentUserEmail(email);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('swatea_user_email');
    } catch (e) {
      console.error(e);
    }
    setCurrentUserEmail(null);
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'chat':
        return language === 'ta' ? 'AI சாட் ஹப் (Chat Hub)' : 'AI Chat Hub';
      case 'website':
        return language === 'ta' ? 'AI வெப்சைட் பில்டர் (Website Studio)' : 'AI Website Studio';
      case 'voice':
        return language === 'ta' ? 'குரல் உதவி (Voice Assistant)' : 'Voice & Audio Assistant';
      case 'admin':
        return language === 'ta' ? 'நிர்வாக போர்ட்டல் (Enterprise Admin)' : 'Enterprise Admin Portal';
      default:
        return 'Swatea AI OS X';
    }
  };

  // If user is not logged in, render the Login Screen
  if (!currentUserEmail) {
    return (
      <LoginView
        language={language}
        onLogin={handleLogin}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none relative transition-colors duration-200 ${
      theme === 'light'
        ? 'bg-slate-50 text-slate-900 light'
        : 'bg-slate-950 text-slate-100 bg-dot-pattern dark'
    }`}>
      {/* Futuristic Ambient Radial Glow Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* OS Top Navbar */}
      <Header
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        activeModuleTitle={getModuleTitle()}
        currentUserEmail={currentUserEmail}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* Main OS Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-4 gap-2 sm:gap-4 max-w-[1920px] w-full mx-auto pb-14 lg:pb-0 z-10">
        {/* Sidebar Navigation */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          language={language}
          isAdmin={isAdmin}
          currentUserEmail={currentUserEmail}
          onLogout={handleLogout}
        />

        {/* Dynamic OS Module Workspace */}
        <main className="flex-1 h-full min-w-0 overflow-hidden relative">
          {activeModule === 'chat' && (
            <ChatModule language={language} currentUserEmail={currentUserEmail} />
          )}
          {activeModule === 'website' && <WebsiteModule language={language} />}
          {activeModule === 'voice' && <VoiceModule language={language} />}
          {activeModule === 'admin' && (
            <AdminModule
              language={language}
              currentUserEmail={currentUserEmail}
              isAdmin={isAdmin}
            />
          )}
        </main>
      </div>

      {/* OS Bottom Status Footer */}
      <FooterBar />
    </div>
  );
}
