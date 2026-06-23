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


// Phase 4 - Image Tools Expansion (13 tools)
import ImageCropper from '../tools/ImageCropper';
import ImageResizer from '../tools/ImageResizer';
import ImageConverter from '../tools/ImageConverter';
import ImageRotator from '../tools/ImageRotator';
import ImageWatermark from '../tools/ImageWatermark';
import ImageBlur from '../tools/ImageBlur';
import BackgroundRemover from '../tools/BackgroundRemover';
import MetadataViewer from '../tools/MetadataViewer';
import ImageToBase64 from '../tools/ImageToBase64';
import Base64ToImage from '../tools/Base64ToImage';
import ImagesToZip from '../tools/ImagesToZip';
import ImageColorPicker from '../tools/ImageColorPicker';
import QRScannerImage from '../tools/QRScannerImage';


// Phase 5 - PDF Tools (16 tools)
import PDFMerge from '../tools/PDFMerge';
import PDFSplit from '../tools/PDFSplit';
import PDFCompressor from '../tools/PDFCompressor';
import PDFPageRemover from '../tools/PDFPageRemover';
import PDFPageReorder from '../tools/PDFPageReorder';
import PDFRotate from '../tools/PDFRotate';
import PDFPasswordProtect from '../tools/PDFPasswordProtect';
import PDFUnlock from '../tools/PDFUnlock';
import PDFWatermark from '../tools/PDFWatermark';
import PDFPageNumbering from '../tools/PDFPageNumbering';
import ExtractTextPDF from '../tools/ExtractTextPDF';
import PDFMetadataViewer from '../tools/PDFMetadataViewer';
import PDFToWord from '../tools/PDFToWord';
import WordToPDF from '../tools/WordToPDF';
import ExcelToPDF from '../tools/ExcelToPDF';
import PowerPointToPDF from '../tools/PowerPointToPDF';

// New Restructured Categories Calculators
import WordCounter from '../tools/WordCounter';
import MetaTagGenerator from '../tools/MetaTagGenerator';
import DiscountCalculator from '../tools/DiscountCalculator';
import BMICalculator from '../tools/BMICalculator';
import MileageCalculator from '../tools/MileageCalculator';
import PasswordGenerator from '../tools/PasswordGenerator';
import GPACalculator from '../tools/GPACalculator';

// New Web Tools
import OpenGraphPreview from '../tools/OpenGraphPreview';
import RobotsTxtGenerator from '../tools/RobotsTxtGenerator';
import SitemapGenerator from '../tools/SitemapGenerator';
import CanonicalUrlGenerator from '../tools/CanonicalUrlGenerator';
import FaviconGenerator from '../tools/FaviconGenerator';
import HtmlEntityEncoder from '../tools/HtmlEntityEncoder';
import CssMinifier from '../tools/CssMinifier';
import JsMinifier from '../tools/JsMinifier';
import CssBeautifier from '../tools/CssBeautifier';
import JsBeautifier from '../tools/JsBeautifier';

// New Developer Tools
import JSONValidator from '../tools/JSONValidator';
import JSONCompare from '../tools/JSONCompare';
import SQLMinifier from '../tools/SQLMinifier';
import XMLFormatter from '../tools/XMLFormatter';
import YAMLFormatter from '../tools/YAMLFormatter';
import HTMLFormatter from '../tools/HTMLFormatter';
import TimestampConverter from '../tools/TimestampConverter';
import CronGenerator from '../tools/CronGenerator';
import LoremIpsumGenerator from '../tools/LoremIpsumGenerator';

// New Business Tools
import ProfitMarginCalculator from '../tools/ProfitMarginCalculator';
import BreakEvenCalculator from '../tools/BreakEvenCalculator';
import ROICalculator from '../tools/ROICalculator';
import InvoiceNumberGenerator from '../tools/InvoiceNumberGenerator';
import BarcodeGenerator from '../tools/BarcodeGenerator';
import InventoryCalculator from '../tools/InventoryCalculator';
import GSTInvoiceGenerator from '../tools/GSTInvoiceGenerator';

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

  // New Calculators Registration
  WordCounter,
  MetaTagGenerator,
  DiscountCalculator,
  BMICalculator,
  MileageCalculator,
  PasswordGenerator,
  GPACalculator,

  // New Business Tools Registration
  ProfitMarginCalculator,
  BreakEvenCalculator,
  ROICalculator,
  InvoiceNumberGenerator,
  BarcodeGenerator,
  InventoryCalculator,
  GSTInvoiceGenerator,

  // New Developer Tools Registration
  JSONValidator,
  JSONCompare,
  SQLMinifier,
  XMLFormatter,
  YAMLFormatter,
  HTMLFormatter,
  TimestampConverter,
  CronGenerator,
  LoremIpsumGenerator,

  // New Web Tools Registration
  OpenGraphPreview,
  RobotsTxtGenerator,
  SitemapGenerator,
  CanonicalUrlGenerator,
  FaviconGenerator,
  HtmlEntityEncoder,
  CssMinifier,
  JsMinifier,
  CssBeautifier,
  JsBeautifier,

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

  // Phase 4 - Image Tools Expansion
  ImageCropper,
  ImageResizer,
  ImageConverter,
  ImageRotator,
  ImageWatermark,
  ImageBlur,
  BackgroundRemover,
  MetadataViewer,
  ImageToBase64,
  Base64ToImage,
  ImagesToZip,
  ImageColorPicker,
  QRScannerImage,

  // Phase 5 - PDF Tools
  PDFMerge,
  PDFSplit,
  PDFCompressor,
  PDFPageRemover,
  PDFPageReorder,
  PDFRotate,
  PDFPasswordProtect,
  PDFUnlock,
  PDFWatermark,
  PDFPageNumbering,
  ExtractTextPDF,
  PDFMetadataViewer,
  PDFToWord,
  WordToPDF,
  ExcelToPDF,
  PowerPointToPDF,
};

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = toolsList.find((t) => t.slug === slug);

  if (!tool) {
    return (
      <div className="text-center py-20 space-y-6 max-w-md mx-auto">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Tool Not Found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          The tool you are looking for does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="saas-button-primary inline-flex"
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
    'url': `https://toolique.in/tool/${tool.slug}`,
    'description': tool.shortDescription,
    'applicationCategory': tool.category === 'finance' ? 'FinanceApplication' : tool.category === 'developer' ? 'DeveloperApplication' : 'UtilityApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires JavaScript. Requires HTML5.'
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6">
      <SEO
        title={`${tool.name} | Free Online Browser Tool`}
        description={tool.metaDescription}
        keywords={tool.keywords}
        canonicalUrl={`https://toolique.in/tool/${tool.slug}`}
        schemaMarkup={toolSchema}
      />

      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <Link to="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <Link to={`/?category=${tool.category}`} className="capitalize hover:text-indigo-500 transition-colors">
            {tool.category}
          </Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">{tool.name}</span>
        </div>
      </div>

      {/* Tool Header */}
      <div className="space-y-3 text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-905 dark:text-zinc-50 tracking-tight">
          {tool.name}
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-4xl">
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
          <div className="p-8 text-center rounded-2xl bg-zinc-900 border border-zinc-800">
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
        <section className="saas-card p-6 md:p-8 text-left space-y-6">
          {tool.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                {section.title}
              </h2>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-450 leading-relaxed whitespace-pre-line">
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

