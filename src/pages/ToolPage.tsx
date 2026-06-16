import { useParams, Link } from 'react-router-dom';
import { toolsList } from '../data/tools';
import { additionalFaqs } from '../data/toolFaqs';
import { ArrowLeft } from 'lucide-react';
import AdPlaceholder from '../components/AdPlaceholder';
import FAQSection from '../components/FAQSection';
import HowToUse from '../components/HowToUse';
import RelatedTools from '../components/RelatedTools';
import SEO from '../components/SEO';

// Import all 31 tools
import GSTCalculator from '../tools/GSTCalculator';
import SIPCalculator from '../tools/SIPCalculator';
import EMICalculator from '../tools/EMICalculator';
import AgeCalculator from '../tools/AgeCalculator';
import ExperienceCalculator from '../tools/ExperienceCalculator';
import SQLFormatter from '../tools/SQLFormatter';
import JSONFormatter from '../tools/JSONFormatter';
import QRCodeGenerator from '../tools/QRCodeGenerator';
import ImageCompressor from '../tools/ImageCompressor';
import UPIQRGenerator from '../tools/UPIQRGenerator';
import TDSCalculator from '../tools/TDSCalculator';
import InHandSalaryCalculator from '../tools/InHandSalaryCalculator';

// Phase 2 - Finance (8 tools)
import FDCalculator from '../tools/FDCalculator';
import RDCalculator from '../tools/RDCalculator';
import PPFCalculator from '../tools/PPFCalculator';
import NPSCalculator from '../tools/NPSCalculator';
import GratuityCalculator from '../tools/GratuityCalculator';
import HRACalculator from '../tools/HRACalculator';
import CAGRCalculator from '../tools/CAGRCalculator';
import GSTIncExcCalculator from '../tools/GSTIncExcCalculator';

// Phase 2 - Utilities (5 tools)
import PercentageCalculator from '../tools/PercentageCalculator';
import DateCalculator from '../tools/DateCalculator';
import DaysBetweenDates from '../tools/DaysBetweenDates';
import CurrencyConverter from '../tools/CurrencyConverter';
import UnitConverter from '../tools/UnitConverter';

// Phase 2 - Developers (6 tools)
import Base64Tool from '../tools/Base64Tool';
import JWTDecoder from '../tools/JWTDecoder';
import UUIDGenerator from '../tools/UUIDGenerator';
import HashGenerator from '../tools/HashGenerator';
import URLEncoderDecoder from '../tools/URLEncoderDecoder';
import RegexTester from '../tools/RegexTester';

// Phase 3 - Civil Engineering (9 tools)
import ConstructionCostCalculator from '../tools/ConstructionCostCalculator';
import BOQCalculator from '../tools/BOQCalculator';
import ConcreteCalculator from '../tools/ConcreteCalculator';
import BrickCalculator from '../tools/BrickCalculator';
import RCCCalculator from '../tools/RCCCalculator';
import SteelWeightCalculator from '../tools/SteelWeightCalculator';
import ColumnDesignCalculator from '../tools/ColumnDesignCalculator';
import SlabCalculator from '../tools/SlabCalculator';
import FoundationCalculator from '../tools/FoundationCalculator';

// Phase 3 - Architecture (7 tools)
import FARFSICalculator from '../tools/FARFSICalculator';
import StaircaseCalculator from '../tools/StaircaseCalculator';
import RoomAreaCalculator from '../tools/RoomAreaCalculator';
import CarpetAreaCalculator from '../tools/CarpetAreaCalculator';
import FloorTileCalculator from '../tools/FloorTileCalculator';
import PaintCalculator from '../tools/PaintCalculator';
import WallpaperCalculator from '../tools/WallpaperCalculator';

// Phase 3 - Interior Design (4 tools)
import FlooringCostCalculator from '../tools/FlooringCostCalculator';
import FalseCeilingCalculator from '../tools/FalseCeilingCalculator';
import ModularKitchenCostCalculator from '../tools/ModularKitchenCostCalculator';
import WardrobeCostCalculator from '../tools/WardrobeCostCalculator';

const toolComponents: Record<string, React.ComponentType> = {
  GSTCalculator,
  SIPCalculator,
  EMICalculator,
  AgeCalculator,
  ExperienceCalculator,
  SQLFormatter,
  JSONFormatter,
  QRCodeGenerator,
  ImageCompressor,
  UPIQRGenerator,
  TDSCalculator,
  InHandSalaryCalculator,

  // Phase 2 - Finance
  FDCalculator,
  RDCalculator,
  PPFCalculator,
  NPSCalculator,
  GratuityCalculator,
  HRACalculator,
  CAGRCalculator,
  GSTIncExcCalculator,

  // Phase 2 - Utilities
  PercentageCalculator,
  DateCalculator,
  DaysBetweenDates,
  CurrencyConverter,
  UnitConverter,

  // Phase 2 - Developers
  Base64Tool,
  JWTDecoder,
  UUIDGenerator,
  HashGenerator,
  URLEncoderDecoder,
  RegexTester,

  // Phase 3 - Civil Engineering
  ConstructionCostCalculator,
  BOQCalculator,
  ConcreteCalculator,
  BrickCalculator,
  RCCCalculator,
  SteelWeightCalculator,
  ColumnDesignCalculator,
  SlabCalculator,
  FoundationCalculator,

  // Phase 3 - Architecture
  FARFSICalculator,
  StaircaseCalculator,
  RoomAreaCalculator,
  CarpetAreaCalculator,
  FloorTileCalculator,
  PaintCalculator,
  WallpaperCalculator,

  // Phase 3 - Interior Design
  FlooringCostCalculator,
  FalseCeilingCalculator,
  ModularKitchenCostCalculator,
  WardrobeCostCalculator,
};

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = toolsList.find((t) => t.slug === slug);

  if (!tool) {
    return (
      <div className="text-center py-20 space-y-6 max-w-md mx-auto">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Tool Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400">
          The tool you are looking for does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-bold text-white shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const ActiveToolComponent = toolComponents[tool.id];

  // Schema markup for individual tool page (SoftwareApplication / WebAPI)
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': tool.name,
    'url': `https://Toolique/tool/${tool.slug}`,
    'description': tool.shortDescription,
    'applicationCategory': tool.category === 'finance' ? 'FinanceApplication' : tool.category === 'developer' ? 'DeveloperApplication' : 'UtilityApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires JavaScript. Requires HTML5.'
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SEO
        title={`${tool.name} | Free Online Browser Tool`}
        description={tool.metaDescription}
        keywords={tool.keywords}
        schemaMarkup={toolSchema}
      />

      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Home</span>
        </Link>
        <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">&gt;</span>
          <span className="capitalize">{tool.category}</span>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-600 dark:text-slate-350">{tool.name}</span>
        </div>
      </div>

      {/* Tool Header */}
      <div className="space-y-3 text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
          {tool.shortDescription}
        </p>
      </div>

      {/* Ad slot - Top Banner */}
      <AdPlaceholder slot={`tool-top-${tool.slug}`} type="banner" />

      {/* Main Tool Container */}
      <section className="mt-6">
        {ActiveToolComponent ? (
          <ActiveToolComponent />
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200">
            Component not implemented yet: {tool.id}
          </div>
        )}
      </section>

      {/* Ad slot - Responsive Ad */}
      <AdPlaceholder slot={`tool-middle-${tool.slug}`} type="responsive" />

      {/* How to Use Section */}
      <HowToUse steps={tool.howToUse} toolName={tool.name} />

      {/* FAQs Section */}
      <FAQSection faqs={[...tool.faqs, ...(additionalFaqs[tool.id] || [])]} />

      {/* Educational Guide Articles */}
      {tool.sections && tool.sections.length > 0 && (
        <section className="mt-8 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-left space-y-6">
          {tool.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800/60 pb-2">
                {section.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Related Tools */}
      <RelatedTools currentToolSlug={tool.slug} category={tool.category} />
    </div>
  );
}

