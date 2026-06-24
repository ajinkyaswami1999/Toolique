import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import ToolPage from '../pages/ToolPage';
import About from '../pages/About';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import Disclaimer from '../pages/Disclaimer';
import ThreeDPrintStudio from '../pages/ThreeDPrintStudio';
import MathStudio from '../pages/MathStudio';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/3d-print-studio" element={<ThreeDPrintStudio />} />
      <Route path="/math-studio" element={<MathStudio />} />
      <Route path="/tools/advanced-boq-calculator-india" element={<ToolPage overrideSlug="advanced-boq-calculator-india" />} />
      <Route path="/tool/:slug" element={<ToolPage />} />
      <Route path="/about" element={<About />} />
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
