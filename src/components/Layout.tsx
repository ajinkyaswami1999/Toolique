import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingActionMenu from './floating/FloatingActionMenu';

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
    <div className="flex flex-col min-h-screen pastel-canvas-bg text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Ambient multi-point pastel aura blooms */}
      <div className="fixed -top-[12%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] bg-gradient-to-br from-indigo-300/30 via-purple-200/20 to-transparent dark:from-indigo-500/[0.08] dark:to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[15%] -right-[8%] w-[50vw] h-[50vw] max-w-[600px] bg-gradient-to-bl from-rose-200/30 via-pink-100/20 to-transparent dark:from-rose-500/[0.06] dark:to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[50%] -left-[6%] w-[45vw] h-[45vw] max-w-[550px] bg-gradient-to-tr from-cyan-200/25 via-teal-200/20 to-transparent dark:from-cyan-500/[0.05] dark:to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed -bottom-[10%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] bg-gradient-to-tl from-amber-200/25 via-emerald-200/20 to-transparent dark:from-emerald-500/[0.06] dark:to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

      <Header />
      {/* Spacer for fixed top navigation bar */}
      <div className="h-15 w-full shrink-0" aria-hidden="true" />
      <main className="flex-grow max-w-7xl 2xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {children}
      </main>
      <Footer />

      {/* Global Speed Dial Floating Action Menu */}
      <FloatingActionMenu />
    </div>
  );
}
