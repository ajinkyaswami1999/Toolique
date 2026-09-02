import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Home from '../pages/Home';
import ToolPage from '../pages/ToolPage';
import About from '../pages/About';
import WhyToolique from '../pages/WhyToolique';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import Disclaimer from '../pages/Disclaimer';
import ThreeDPrintStudio from '../pages/ThreeDPrintStudio';
import Status from '../pages/Status';
import MathStudio from '../pages/MathStudio';
import { toolsList } from '../data/tools';

const AboutFounder = lazy(() => import('../pages/AboutFounder'));
const AcademyLanding = lazy(() => import('../features/academy/pages/AcademyLanding'));
const AcademyCategory = lazy(() => import('../features/academy/pages/AcademyCategory'));
const AcademyQuestion = lazy(() => import('../features/academy/pages/AcademyQuestion'));
const AcademyBookmarks = lazy(() => import('../features/academy/pages/AcademyBookmarks'));
const AcademyLearn = lazy(() => import('../features/academy/pages/AcademyLearn'));
const AcademyPlayground = lazy(() => import('../features/academy/pages/AcademyPlayground'));

const AIStudio = lazy(() => import('../pages/AIStudio'));
const PlaygroundHub = lazy(() => import('../pages/PlaygroundHub'));
const BlogResources = lazy(() => import('../pages/BlogResources'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CategoryLanding = lazy(() => import('../pages/CategoryLanding'));
const ArchitectureHub = lazy(() => import('../pages/ArchitectureHub'));
const QAHub = lazy(() => import('../pages/QAHub'));
const FinanceHub = lazy(() => import('../pages/FinanceHub'));
const DeveloperHub = lazy(() => import('../pages/DeveloperHub'));
const ToolsDirectory = lazy(() => import('../pages/ToolsDirectory'));
const NotFound = lazy(() => import('../pages/NotFound'));

export function getToolCanonicalPath(category: string, slug: string): string {
  if (category === 'civil') {
    return `/civil/${slug}`;
  } else if (category === 'architecture') {
    return `/architecture/${slug}`;
  } else if (['developer', 'web'].includes(category)) {
    return `/developer/${slug}`;
  } else if (category === 'qa') {
    return `/qa/${slug}`;
  } else {
    return `/calculators/${slug}`;
  }
}

export function getCategoryCanonicalPath(category: string): string {
  if (category === 'civil') {
    return `/civil`;
  } else if (category === 'architecture') {
    return `/architecture`;
  } else if (['developer', 'web', 'security'].includes(category)) {
    return `/developer`;
  } else if (category === 'qa') {
    return `/qa`;
  } else if (category === 'finance') {
    return `/finance`;
  } else {
    return `/calculators`;
  }
}

function LegacyToolRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const tool = toolsList.find((t) => t.slug === slug);
  if (!tool) {
    return <Navigate to="/tools" replace />;
  }
  return <Navigate to={getToolCanonicalPath(tool.category, tool.slug)} replace />;
}

function LegacyCategoryRedirect() {
  const { categoryName } = useParams<{ categoryName: string }>();
  return <Navigate to={getCategoryCanonicalPath(categoryName || '')} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tools" element={
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">
            Loading Directory...
          </div>
        }>
          <ToolsDirectory />
        </Suspense>
      } />

      {/* Primary Pillar Category Routes */}
      <Route path="/calculators" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Calculators...</div>}>
          <CategoryLanding overrideCategory="calculators" />
        </Suspense>
      } />
      <Route path="/architecture" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Architecture Suite...</div>}>
          <ArchitectureHub />
        </Suspense>
      } />
      <Route path="/civil" element={<Navigate to="/architecture" replace />} />
      <Route path="/developer" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Developer Suite...</div>}>
          <DeveloperHub />
        </Suspense>
      } />
      <Route path="/qa" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading QA Workspace...</div>}>
          <QAHub />
        </Suspense>
      } />
      <Route path="/finance" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Finance Suite...</div>}>
          <FinanceHub />
        </Suspense>
      } />

      {/* Primary Pillar Tool Detail Routes */}
      <Route path="/calculators/:slug" element={<ToolPage />} />
      <Route path="/architecture/:slug" element={<ToolPage />} />
      <Route path="/civil/:slug" element={<ToolPage />} />
      <Route path="/developer/:slug" element={<ToolPage />} />
      <Route path="/qa/:slug" element={<ToolPage />} />
      <Route path="/finance/:slug" element={<Navigate to="/calculators/:slug" replace />} />

      {/* Legacy Category & Tool Redirects */}
      <Route path="/tools/:categoryName" element={<LegacyCategoryRedirect />} />
      <Route path="/tool/:slug" element={<LegacyToolRedirect />} />
      <Route path="/tools/advanced-boq-calculator-india" element={<Navigate to="/civil/advanced-boq-calculator-india" replace />} />
      <Route path="/architecture-tools" element={<Navigate to="/architecture" replace />} />
      <Route path="/qa-tools" element={<Navigate to="/qa" replace />} />
      <Route path="/finance-tools" element={<Navigate to="/finance" replace />} />
      <Route path="/developer-tools" element={<Navigate to="/developer" replace />} />

      <Route path="/ai" element={
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">
            Loading AI Studio...
          </div>
        }>
          <AIStudio />
        </Suspense>
      } />
      <Route path="/playground" element={
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">
            Loading Playground...
          </div>
        }>
          <PlaygroundHub />
        </Suspense>
      } />
      <Route path="/dashboard" element={
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">
            Loading Profile...
          </div>
        }>
          <Dashboard />
        </Suspense>
      } />
      <Route path="/blog" element={
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">
            Loading Resources...
          </div>
        }>
          <BlogResources />
        </Suspense>
      } />
      <Route path="/3d-printing" element={<ThreeDPrintStudio />} />
      <Route path="/3d-print-studio" element={<ThreeDPrintStudio />} />
      <Route path="/math-studio" element={<MathStudio />} />
      <Route path="/about" element={<About />} />
      <Route path="/why-toolique" element={<WhyToolique />} />
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
      <Route path="/academy/learn" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Learn Paths...</div>}>
          <AcademyLearn />
        </Suspense>
      } />
      <Route path="/academy/playgrounds" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading Playgrounds...</div>}>
          <AcademyPlayground />
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
      <Route path="/status" element={<Status />} />
      <Route path="*" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-zinc-500 text-xs font-semibold">Loading...</div>}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
}
