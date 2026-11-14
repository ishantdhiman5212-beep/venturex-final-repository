import React, { useState, useEffect } from 'react';
import { CitizenShell } from './components/CitizenShell';
import { HomePage } from './pages/HomePage';
import { ScanPage } from './pages/ScanPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ApplyPage } from './pages/ApplyPage';
import { TokenPage } from './pages/TokenPage';
import { StatusPage } from './pages/StatusPage';
import { AdminPage } from './pages/AdminPage';
import { SplitDemoPage } from './pages/SplitDemoPage';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse path and query
  const pathname = currentPath.split('?')[0];
  const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');

  let content: React.ReactNode = null;

  if (pathname === '/' || pathname === '') {
    content = <HomePage onNavigate={navigate} />;
  } else if (pathname === '/split') {
    content = <SplitDemoPage onNavigate={navigate} />;
  } else if (pathname === '/scan') {
    content = <ScanPage onNavigate={navigate} />;
  } else if (pathname === '/services') {
    content = (
      <ServicesPage
        onNavigate={navigate}
        initialCategory={searchParams.get('category') || undefined}
        initialInstitution={searchParams.get('institution') || undefined}
      />
    );
  } else if (pathname.startsWith('/services/')) {
    const serviceId = pathname.replace('/services/', '');
    content = <ServiceDetailPage serviceId={serviceId} onNavigate={navigate} />;
  } else if (pathname.startsWith('/apply/')) {
    const serviceId = pathname.replace('/apply/', '');
    content = <ApplyPage serviceId={serviceId} onNavigate={navigate} />;
  } else if (pathname.startsWith('/token/')) {
    const tokenId = pathname.replace('/token/', '');
    content = <TokenPage tokenId={tokenId} onNavigate={navigate} />;
  } else if (pathname === '/status') {
    content = <StatusPage initialId={searchParams.get('id') || undefined} onNavigate={navigate} />;
  } else if (pathname === '/admin') {
    content = <AdminPage onNavigate={navigate} />;
  } else {
    // 404 Fallback
    content = (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-extrabold text-foreground">404</h1>
        <p className="mt-2 text-lg font-bold text-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">The requested page does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <CitizenShell activePath={pathname} onNavigate={navigate}>
      {content}
    </CitizenShell>
  );
}
