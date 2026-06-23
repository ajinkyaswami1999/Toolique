import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname, hash } = useLocation();

  // Scroll to top on path change, or to element on hash change
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="fixed -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] bg-indigo-500/5 dark:bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] bg-teal-500/5 dark:bg-teal-500/[0.015] rounded-full blur-[130px] pointer-events-none -z-10" />

      <Header />
      <main className="flex-grow max-w-7xl 2xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
