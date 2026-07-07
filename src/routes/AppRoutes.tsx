import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Home from '../pages/Home';
import ToolPage from '../pages/ToolPage';
import About from '../pages/About';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import Disclaimer from '../pages/Disclaimer';
import ThreeDPrintStudio from '../pages/ThreeDPrintStudio';
import MathStudio from '../pages/MathStudio';

const AboutFounder = lazy(() => import('../pages/AboutFounder'));
const AcademyLanding = lazy(() => import('../features/academy/pages/AcademyLanding'));
const AcademyCategory = lazy(() => import('../features/academy/pages/AcademyCategory'));
const AcademyQuestion = lazy(() => import('../features/academy/pages/AcademyQuestion'));
const AcademyBookmarks = lazy(() => import('../features/academy/pages/AcademyBookmarks'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/3d-print-studio" element={<ThreeDPrintStudio />} />
      <Route path="/math-studio" element={<MathStudio />} />
      <Route path="/tools/advanced-boq-calculator-india" element={<ToolPage overrideSlug="advanced-boq-calculator-india" />} />
      <Route path="/tool/:slug" element={<ToolPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/about-founder" element={
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">
            Loading...
          </div>
        }>
          <AboutFounder />
        </Suspense>
      } />
      <Route path="/academy" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Academy...</div>}>
          <AcademyLanding />
        </Suspense>
      } />
      <Route path="/academy/bookmarks" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Bookmarks...</div>}>
          <AcademyBookmarks />
        </Suspense>
      } />
      <Route path="/academy/:category" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Track...</div>}>
          <AcademyCategory />
        </Suspense>
      } />
      <Route path="/academy/:category/question/:questionSlug" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Question...</div>}>
          <AcademyQuestion />
        </Suspense>
      } />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="*" element={
        <div className="text-center py-20 space-y-4">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Page Not Found</h2>
          <p className="text-slate-500">The page you are looking for does not exist.</p>
          <a href="/" className="inline-block px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-sm">
            Return Home
          </a>
        </div>
      } />
    </Routes>
  );
}
