import { lazy, Suspense } from 'react';
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
const GSTCalculator = lazy(() => import('../tools/GSTCalculator'));
const SIPCalculator = lazy(() => import('../tools/SIPCalculator'));
const EMICalculator = lazy(() => import('../tools/EMICalculator'));
const AgeCalculator = lazy(() => import('../tools/AgeCalculator'));
const ExperienceCalculator = lazy(() => import('../tools/ExperienceCalculator'));
const SQLFormatter = lazy(() => import('../tools/SQLFormatter'));
const JSONFormatter = lazy(() => import('../tools/JSONFormatter'));
const QRCodeGenerator = lazy(() => import('../tools/QRCodeGenerator'));
const ImageCompressor = lazy(() => import('../tools/ImageCompressor'));
const UPIQRGenerator = lazy(() => import('../tools/UPIQRGenerator'));
const TDSCalculator = lazy(() => import('../tools/TDSCalculator'));
const InHandSalaryCalculator = lazy(() => import('../tools/InHandSalaryCalculator'));

// Phase 2 - Finance (8 tools)
const FDCalculator = lazy(() => import('../tools/FDCalculator'));
const RDCalculator = lazy(() => import('../tools/RDCalculator'));
const PPFCalculator = lazy(() => import('../tools/PPFCalculator'));
const NPSCalculator = lazy(() => import('../tools/NPSCalculator'));
const GratuityCalculator = lazy(() => import('../tools/GratuityCalculator'));
const HRACalculator = lazy(() => import('../tools/HRACalculator'));
const CAGRCalculator = lazy(() => import('../tools/CAGRCalculator'));
const GSTIncExcCalculator = lazy(() => import('../tools/GSTIncExcCalculator'));

// Phase 2 - Utilities (5 tools)
const PercentageCalculator = lazy(() => import('../tools/PercentageCalculator'));
const DateCalculator = lazy(() => import('../tools/DateCalculator'));
const DaysBetweenDates = lazy(() => import('../tools/DaysBetweenDates'));
const CurrencyConverter = lazy(() => import('../tools/CurrencyConverter'));
const UnitConverter = lazy(() => import('../tools/UnitConverter'));

// Phase 2 - Developers (6 tools)
const Base64Tool = lazy(() => import('../tools/Base64Tool'));
const JWTDecoder = lazy(() => import('../tools/JWTDecoder'));
const UUIDGenerator = lazy(() => import('../tools/UUIDGenerator'));
const HashGenerator = lazy(() => import('../tools/HashGenerator'));
const URLEncoderDecoder = lazy(() => import('../tools/URLEncoderDecoder'));
const RegexTester = lazy(() => import('../tools/RegexTester'));

// Phase 3 - Civil Engineering (9 tools)
const ConstructionCostCalculator = lazy(() => import('../tools/ConstructionCostCalculator'));
const BOQCalculator = lazy(() => import('../tools/BOQCalculator'));
const ConcreteCalculator = lazy(() => import('../tools/ConcreteCalculator'));
const BrickCalculator = lazy(() => import('../tools/BrickCalculator'));
const RCCCalculator = lazy(() => import('../tools/RCCCalculator'));
const SteelWeightCalculator = lazy(() => import('../tools/SteelWeightCalculator'));
const ColumnDesignCalculator = lazy(() => import('../tools/ColumnDesignCalculator'));
const SlabCalculator = lazy(() => import('../tools/SlabCalculator'));
const FoundationCalculator = lazy(() => import('../tools/FoundationCalculator'));

// Phase 3 - Architecture (7 tools)
const FARFSICalculator = lazy(() => import('../tools/FARFSICalculator'));
const StaircaseCalculator = lazy(() => import('../tools/StaircaseCalculator'));
const RoomAreaCalculator = lazy(() => import('../tools/RoomAreaCalculator'));
const CarpetAreaCalculator = lazy(() => import('../tools/CarpetAreaCalculator'));
const FloorTileCalculator = lazy(() => import('../tools/FloorTileCalculator'));
const PaintCalculator = lazy(() => import('../tools/PaintCalculator'));
const WallpaperCalculator = lazy(() => import('../tools/WallpaperCalculator'));

// Phase 3 - Interior Design (4 tools)
const FlooringCostCalculator = lazy(() => import('../tools/FlooringCostCalculator'));
const FalseCeilingCalculator = lazy(() => import('../tools/FalseCeilingCalculator'));
const ModularKitchenCostCalculator = lazy(() => import('../tools/ModularKitchenCostCalculator'));
const WardrobeCostCalculator = lazy(() => import('../tools/WardrobeCostCalculator'));


// Phase 4 - Image Tools Expansion (13 tools)
const ImageCropper = lazy(() => import('../tools/ImageCropper'));
const ImageResizer = lazy(() => import('../tools/ImageResizer'));
const ImageConverter = lazy(() => import('../tools/ImageConverter'));
const ImageRotator = lazy(() => import('../tools/ImageRotator'));
const ImageWatermark = lazy(() => import('../tools/ImageWatermark'));
const ImageBlur = lazy(() => import('../tools/ImageBlur'));
const BackgroundRemover = lazy(() => import('../tools/BackgroundRemover'));
const MetadataViewer = lazy(() => import('../tools/MetadataViewer'));
const ImageToBase64 = lazy(() => import('../tools/ImageToBase64'));
const Base64ToImage = lazy(() => import('../tools/Base64ToImage'));
const ImagesToZip = lazy(() => import('../tools/ImagesToZip'));
const ImageColorPicker = lazy(() => import('../tools/ImageColorPicker'));
const QRScannerImage = lazy(() => import('../tools/QRScannerImage'));


// Phase 5 - PDF Tools (16 tools)
const PDFMerge = lazy(() => import('../tools/PDFMerge'));
const PDFSplit = lazy(() => import('../tools/PDFSplit'));
const PDFCompressor = lazy(() => import('../tools/PDFCompressor'));
const PDFPageRemover = lazy(() => import('../tools/PDFPageRemover'));
const PDFPageReorder = lazy(() => import('../tools/PDFPageReorder'));
const PDFRotate = lazy(() => import('../tools/PDFRotate'));
const PDFPasswordProtect = lazy(() => import('../tools/PDFPasswordProtect'));
const PDFUnlock = lazy(() => import('../tools/PDFUnlock'));
const PDFWatermark = lazy(() => import('../tools/PDFWatermark'));
const PDFPageNumbering = lazy(() => import('../tools/PDFPageNumbering'));
const ExtractTextPDF = lazy(() => import('../tools/ExtractTextPDF'));
const PDFMetadataViewer = lazy(() => import('../tools/PDFMetadataViewer'));
const PDFToWord = lazy(() => import('../tools/PDFToWord'));
const WordToPDF = lazy(() => import('../tools/WordToPDF'));
const ExcelToPDF = lazy(() => import('../tools/ExcelToPDF'));
const PowerPointToPDF = lazy(() => import('../tools/PowerPointToPDF'));

// New Restructured Categories Calculators
const WordCounter = lazy(() => import('../tools/WordCounter'));
const MetaTagGenerator = lazy(() => import('../tools/MetaTagGenerator'));
const DiscountCalculator = lazy(() => import('../tools/DiscountCalculator'));
const BMICalculator = lazy(() => import('../tools/BMICalculator'));
const MileageCalculator = lazy(() => import('../tools/MileageCalculator'));
const PasswordGenerator = lazy(() => import('../tools/PasswordGenerator'));
const GPACalculator = lazy(() => import('../tools/GPACalculator'));

// New Web Tools
const OpenGraphPreview = lazy(() => import('../tools/OpenGraphPreview'));
const RobotsTxtGenerator = lazy(() => import('../tools/RobotsTxtGenerator'));
const SitemapGenerator = lazy(() => import('../tools/SitemapGenerator'));
const CanonicalUrlGenerator = lazy(() => import('../tools/CanonicalUrlGenerator'));
const FaviconGenerator = lazy(() => import('../tools/FaviconGenerator'));
const HtmlEntityEncoder = lazy(() => import('../tools/HtmlEntityEncoder'));
const CssMinifier = lazy(() => import('../tools/CssMinifier'));
const JsMinifier = lazy(() => import('../tools/JsMinifier'));
const CssBeautifier = lazy(() => import('../tools/CssBeautifier'));
const JsBeautifier = lazy(() => import('../tools/JsBeautifier'));

// New Developer Tools
const JSONValidator = lazy(() => import('../tools/JSONValidator'));
const JSONCompare = lazy(() => import('../tools/JSONCompare'));
const SQLMinifier = lazy(() => import('../tools/SQLMinifier'));
const XMLFormatter = lazy(() => import('../tools/XMLFormatter'));
const YAMLFormatter = lazy(() => import('../tools/YAMLFormatter'));
const HTMLFormatter = lazy(() => import('../tools/HTMLFormatter'));
const TimestampConverter = lazy(() => import('../tools/TimestampConverter'));
const CronGenerator = lazy(() => import('../tools/CronGenerator'));
const LoremIpsumGenerator = lazy(() => import('../tools/LoremIpsumGenerator'));

// New Business Tools
const ProfitMarginCalculator = lazy(() => import('../tools/ProfitMarginCalculator'));
const BreakEvenCalculator = lazy(() => import('../tools/BreakEvenCalculator'));
const ROICalculator = lazy(() => import('../tools/ROICalculator'));
const InvoiceNumberGenerator = lazy(() => import('../tools/InvoiceNumberGenerator'));
const BarcodeGenerator = lazy(() => import('../tools/BarcodeGenerator'));
const InventoryCalculator = lazy(() => import('../tools/InventoryCalculator'));
const GSTInvoiceGenerator = lazy(() => import('../tools/GSTInvoiceGenerator'));

// New Social Media Tools
const InstagramCaptionGenerator = lazy(() => import('../tools/InstagramCaptionGenerator'));
const HashtagGenerator = lazy(() => import('../tools/HashtagGenerator'));
const BioGenerator = lazy(() => import('../tools/BioGenerator'));
const YouTubeThumbnailResizer = lazy(() => import('../tools/YouTubeThumbnailResizer'));
const InstagramPostResizer = lazy(() => import('../tools/InstagramPostResizer'));
const StoryResizer = lazy(() => import('../tools/StoryResizer'));
const FacebookCoverCreator = lazy(() => import('../tools/FacebookCoverCreator'));
const LinkedInBannerResizer = lazy(() => import('../tools/LinkedInBannerResizer'));
const WhatsAppLinkGenerator = lazy(() => import('../tools/WhatsAppLinkGenerator'));

// Electrical Engineering Tools
const VoltageDropCalculator = lazy(() => import('../tools/VoltageDropCalculator'));
const CableSizeCalculator = lazy(() => import('../tools/CableSizeCalculator'));
const LoadCalculator = lazy(() => import('../tools/LoadCalculator'));
const PowerConsumptionCalculator = lazy(() => import('../tools/PowerConsumptionCalculator'));
const UPSCalculator = lazy(() => import('../tools/UPSCalculator'));
const SolarPanelCalculator = lazy(() => import('../tools/SolarPanelCalculator'));
const BatteryBackupCalculator = lazy(() => import('../tools/BatteryBackupCalculator'));
const kWToHPConverter = lazy(() => import('../tools/kWToHPConverter'));
const TransformerCalculator = lazy(() => import('../tools/TransformerCalculator'));
const LEDLightingCalculator = lazy(() => import('../tools/LEDLightingCalculator'));

const FilamentCostCalculator = lazy(() => import('../tools/FilamentCostCalculator'));
const ThreeDPrintingCostCalculator = lazy(() => import('../tools/ThreeDPrintingCostCalculator'));
const PrintProfitCalculator = lazy(() => import('../tools/PrintProfitCalculator'));
const PrintFarmRevenueCalculator = lazy(() => import('../tools/PrintFarmRevenueCalculator'));
const FilamentWeightCalculator = lazy(() => import('../tools/FilamentWeightCalculator'));
const FilamentUsageCalculator = lazy(() => import('../tools/FilamentUsageCalculator'));
const RemainingFilamentCalculator = lazy(() => import('../tools/RemainingFilamentCalculator'));
const MaterialCostComparison = lazy(() => import('../tools/MaterialCostComparison'));
const PrintTimeEstimator = lazy(() => import('../tools/PrintTimeEstimator'));
const LayerHeightCalculator = lazy(() => import('../tools/LayerHeightCalculator'));
const PrintSpeedCalculator = lazy(() => import('../tools/PrintSpeedCalculator'));
const NozzleFlowCalculator = lazy(() => import('../tools/NozzleFlowCalculator'));
const VolumetricFlowCalculator = lazy(() => import('../tools/VolumetricFlowCalculator'));
const CoolingFanRecommendation = lazy(() => import('../tools/CoolingFanRecommendation'));
const NozzleSizeComparison = lazy(() => import('../tools/NozzleSizeComparison'));
const LineWidthCalculator = lazy(() => import('../tools/LineWidthCalculator'));
const LayerWidthCalculator = lazy(() => import('../tools/LayerWidthCalculator'));
const STLVolumeCalculator = lazy(() => import('../tools/STLVolumeCalculator'));
const STLBoundingBoxCalculator = lazy(() => import('../tools/STLBoundingBoxCalculator'));
const ScaleCalculator = lazy(() => import('../tools/ScaleCalculator'));
const ModelWeightCalculator = lazy(() => import('../tools/ModelWeightCalculator'));
const ResinCostCalculator = lazy(() => import('../tools/ResinCostCalculator'));
const ResinVolumeCalculator = lazy(() => import('../tools/ResinVolumeCalculator'));
const ExposureTimeHelper = lazy(() => import('../tools/ExposureTimeHelper'));
const ElectricityCostCalculator = lazy(() => import('../tools/ElectricityCostCalculator'));
const PackagingCostCalculator = lazy(() => import('../tools/PackagingCostCalculator'));
const ShippingCostCalculator = lazy(() => import('../tools/ShippingCostCalculator'));
const MachineUtilizationCalculator = lazy(() => import('../tools/MachineUtilizationCalculator'));
const MonthlyProductionCalculator = lazy(() => import('../tools/MonthlyProductionCalculator'));
const PrintQueueTimeCalculator = lazy(() => import('../tools/PrintQueueTimeCalculator'));
const HueForgeFilamentCalculator = lazy(() => import('../tools/HueForgeFilamentCalculator'));
const HueForgeLayerCalculator = lazy(() => import('../tools/HueForgeLayerCalculator'));
const HueForgeColorSwapPlanner = lazy(() => import('../tools/HueForgeColorSwapPlanner'));
const AMSFilamentPlanner = lazy(() => import('../tools/AMSFilamentPlanner'));
const FilamentChangeEstimator = lazy(() => import('../tools/FilamentChangeEstimator'));
const PurgeWasteCalculator = lazy(() => import('../tools/PurgeWasteCalculator'));
const FlushVolumeCalculator = lazy(() => import('../tools/FlushVolumeCalculator'));
const AMSSlotPlanner = lazy(() => import('../tools/AMSSlotPlanner'));
const BuildPlateUtilizationCalculator = lazy(() => import('../tools/BuildPlateUtilizationCalculator'));

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

  // New Social Media Tools Registration
  InstagramCaptionGenerator,
  HashtagGenerator,
  BioGenerator,
  YouTubeThumbnailResizer,
  InstagramPostResizer,
  StoryResizer,
  FacebookCoverCreator,
  LinkedInBannerResizer,
  WhatsAppLinkGenerator,

  // Electrical Engineering Tools Registration
  VoltageDropCalculator,
  CableSizeCalculator,
  LoadCalculator,
  PowerConsumptionCalculator,
  UPSCalculator,
  SolarPanelCalculator,
  BatteryBackupCalculator,
  kWToHPConverter,
  TransformerCalculator,
  LEDLightingCalculator,

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
  FilamentCostCalculator,
  ThreeDPrintingCostCalculator,
  PrintProfitCalculator,
  PrintFarmRevenueCalculator,
  FilamentWeightCalculator,
  FilamentUsageCalculator,
  RemainingFilamentCalculator,
  MaterialCostComparison,
  PrintTimeEstimator,
  LayerHeightCalculator,
  PrintSpeedCalculator,
  NozzleFlowCalculator,
  VolumetricFlowCalculator,
  CoolingFanRecommendation,
  NozzleSizeComparison,
  LineWidthCalculator,
  LayerWidthCalculator,
  STLVolumeCalculator,
  STLBoundingBoxCalculator,
  ScaleCalculator,
  ModelWeightCalculator,
  ResinCostCalculator,
  ResinVolumeCalculator,
  ExposureTimeHelper,
  ElectricityCostCalculator,
  PackagingCostCalculator,
  ShippingCostCalculator,
  MachineUtilizationCalculator,
  MonthlyProductionCalculator,
  PrintQueueTimeCalculator,
  HueForgeFilamentCalculator,
  HueForgeLayerCalculator,
  HueForgeColorSwapPlanner,
  AMSFilamentPlanner,
  FilamentChangeEstimator,
  PurgeWasteCalculator,
  FlushVolumeCalculator,
  AMSSlotPlanner,
  BuildPlateUtilizationCalculator,
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

  const mergedFaqs = [...tool.faqs, ...(additionalFaqs[tool.id] || [])];

  // Combined Schema markup for Answer Engine Optimization (AEO)
  const toolSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://toolique.in/tool/${tool.slug}#webapp`,
        'name': tool.name,
        'url': `https://toolique.in/tool/${tool.slug}`,
        'description': tool.shortDescription,
        'applicationCategory': tool.category === 'finance' ? 'FinanceApplication' : tool.category === 'developer' ? 'DeveloperApplication' : 'UtilityApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.'
      },
      ...(tool.howToUse && tool.howToUse.length > 0 ? [{
        '@type': 'HowTo',
        '@id': `https://toolique.in/tool/${tool.slug}#howto`,
        'name': `How to use ${tool.name}`,
        'step': tool.howToUse.map((stepText, index) => ({
          '@type': 'HowToStep',
          'position': index + 1,
          'text': stepText
        }))
      }] : []),
      ...(mergedFaqs && mergedFaqs.length > 0 ? [{
        '@type': 'FAQPage',
        '@id': `https://toolique.in/tool/${tool.slug}#faq`,
        'mainEntity': mergedFaqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }] : [])
    ]
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
          to={tool.category === '3d-printing' ? "/3d-print-studio" : "/"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tool.category === '3d-printing' ? "Back to 3D Print Studio" : "Back to Home"}</span>
        </Link>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <Link to="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          {tool.category === '3d-printing' ? (
            <Link to="/3d-print-studio" className="hover:text-indigo-500 transition-colors">
              3D Print Studio
            </Link>
          ) : (
            <Link to={`/?category=${tool.category}`} className="capitalize hover:text-indigo-500 transition-colors">
              {tool.category}
            </Link>
          )}
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
          <Suspense fallback={
            <div className="p-12 saas-card flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Loading calculator...</p>
            </div>
          }>
            <ActiveToolComponent />
          </Suspense>
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

