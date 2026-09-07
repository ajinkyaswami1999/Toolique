import fs from 'fs';
import path from 'path';
import { toolsList, Tool } from '../src/data/tools';
import { categories } from '../src/data/categories';
import { academyCategories } from '../src/features/academy/data/categories';
import { sqlQuestions } from '../src/features/academy/data/questions/sql';
import { pythonQuestions } from '../src/features/academy/data/questions/python';
import { javascriptQuestions } from '../src/features/academy/data/questions/javascript';
import { reactQuestions } from '../src/features/academy/data/questions/react';
import { qaQuestions } from '../src/features/academy/data/questions/qa';

const DIST_DIR = path.resolve('dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

const organizationSchema = {
  '@type': 'Organization',
  '@id': 'https://www.toolique.in/#organization',
  'name': 'Toolique',
  'url': 'https://www.toolique.in',
  'logo': 'https://www.toolique.in/favicon-512x512.png',
  'foundingDate': '2026-06-16',
  'description': 'Toolique is a premium, free, privacy-focused online suite of interactive calculators, developer converters, and programming academy tools operating completely in the browser.',
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'customer support',
    'email': 'support@toolique.in'
  },
  'founder': {
    '@type': 'Person',
    '@id': 'https://www.toolique.in/about-founder#person'
  },
  'sameAs': [
    'https://github.com/ajinkyaswami1999',
    'https://www.linkedin.com/in/ajinkya-swami-82751b191/',
    'https://www.instagram.com/ajinkyaswami.in/',
    'https://voxelique.com',
    'https://www.instagram.com/voxelique/'
  ]
};

const personSchema = {
  '@type': 'Person',
  '@id': 'https://www.toolique.in/about-founder#person',
  'name': 'Ajinkya Swami',
  'jobTitle': 'Founder & Software Architect',
  'image': 'https://www.toolique.in/favicon-512x512.png',
  'description': 'Ajinkya Swami is a QA Automation Engineer, Full-Stack Developer, and founder of Toolique and Voxelique, specializing in custom desktop automation script systems and web application development.',
  'worksFor': {
    '@type': 'Organization',
    '@id': 'https://www.toolique.in/#organization'
  },
  'founderOf': [
    {
      '@type': 'Organization',
      '@id': 'https://www.toolique.in/#organization'
    }
  ],
  'knowsAbout': [
    'Software QA Verification',
    'QA Automation Frameworks',
    'Python & Selenium Models',
    'React & Next.js Stacks',
    '3D Printing Custom Design Solutions'
  ],
  'sameAs': [
    'https://github.com/ajinkyaswami1999',
    'https://www.linkedin.com/in/ajinkya-swami-82751b191/',
    'https://www.instagram.com/ajinkyaswami.in/',
    'https://voxelique.com',
    'https://www.instagram.com/voxelique/'
  ]
};

const websiteSchema = {
  '@type': 'WebSite',
  '@id': 'https://www.toolique.in/#website',
  'name': 'Toolique',
  'url': 'https://www.toolique.in',
  'publisher': {
    '@type': 'Organization',
    '@id': 'https://www.toolique.in/#organization'
  },
  'potentialAction': {
    '@type': 'SearchAction',
    'target': 'https://www.toolique.in/tools?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

const globalEntities = [
  organizationSchema,
  personSchema,
  websiteSchema
];

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('Build template not found at dist/index.html. Run npm run build first.');
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

export function getToolCanonicalPath(category: string, slug: string): string {
  if (category === 'civil') {
    return `civil/${slug}`;
  } else if (category === 'architecture') {
    return `architecture/${slug}`;
  } else if (['developer', 'web'].includes(category)) {
    return `developer/${slug}`;
  } else if (category === 'qa') {
    return `qa/${slug}`;
  } else {
    return `calculators/${slug}`;
  }
}

export function getCategoryCanonicalPath(category: string): string {
  if (category === 'civil') {
    return `civil`;
  } else if (category === 'architecture') {
    return `architecture`;
  } else if (['developer', 'web'].includes(category)) {
    return `developer`;
  } else if (category === 'qa') {
    return `qa`;
  } else {
    return `calculators`;
  }
}

// Helper to write static pre-rendered shell
function generateShell(
  routePath: string,
  title: string,
  description: string,
  keywords: string[],
  schemaMarkup?: object,
  bodyContentOverride?: string
) {
  const cleanPath = routePath.replace(/^\/+|\/+$/g, '');
  const fullUrl = cleanPath === '' ? 'https://www.toolique.in/' : `https://www.toolique.in/${cleanPath}`;
  let html = template.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  // 1. Replace metadata
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);

  // Replace canonical link tag with page-specific URL
  html = html.replace(/<link rel="canonical"[^>]*\/?>/i, `<link rel="canonical" href="${fullUrl}" />`);

  if (keywords.length > 0) {
    const keywordsMeta = `<meta name="keywords" content="${keywords.join(', ')}" />`;
    html = html.replace('</head>', `    ${keywordsMeta}\n  </head>`);
  }

  // 2. Replace Open Graph tags
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${fullUrl}" />`);

  // 3. Replace Twitter tags (upgrade card type to summary_large_image)
  html = html.replace(/<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:card" content="summary_large_image" />`);
  html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
  html = html.replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${fullUrl}" />`);

  // 4. Inject JSON-LD Schema
  const targetSchema: any = schemaMarkup 
    ? JSON.parse(JSON.stringify(schemaMarkup)) 
    : { '@context': 'https://schema.org', '@graph': [] };

  if (!targetSchema['@graph']) {
    targetSchema['@graph'] = [];
  }

  // Merge global entity templates avoiding duplicated @id references
  globalEntities.forEach(entity => {
    if (!targetSchema['@graph'].some((existing: any) => existing['@id'] === entity['@id'])) {
      targetSchema['@graph'].push(entity);
    }
  });

  const schemaScript = `
    <!-- JSON-LD Structured Data for this specific page -->
    <script type="application/ld+json">
    ${JSON.stringify(targetSchema, null, 2)}
    </script>
  </head>`;
  html = html.replace('</head>', schemaScript);

  // 5. Populate body loading state with indexable HTML content
  const rootContent = bodyContentOverride || `
    <div id="root">
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="font-size: 2.5rem; margin-bottom: 10px; color: #111;">${title.split(' | ')[0]}</h1>
        <p style="font-size: 1.2rem; color: #666; margin-bottom: 20px;">${description}</p>
        <div style="background: #f9f9f9; border: 1px solid #eee; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0; font-weight: bold; color: #555;">Loading interactive calculator...</p>
          <p style="margin: 5px 0 0 0; color: #888; font-size: 0.9rem;">Please enable JavaScript if it is disabled in your browser.</p>
        </div>
      </div>
    </div>`;
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, rootContent);

  // Write file
  const targetDir = path.join(DIST_DIR, cleanPath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
}

// Helper to write static redirect shell for legacy URLs
function generateRedirectShell(fromPath: string, canonicalPath: string, name?: string) {
  const cleanFrom = fromPath.replace(/^\/+|\/+$/g, '');
  const cleanTo = canonicalPath.replace(/^\/+|\/+$/g, '');
  const toUrl = `https://www.toolique.in/${cleanTo}`;
  const label = name || 'Resource';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting to ${label} | Toolique</title>
  <meta name="description" content="Redirecting to ${label} on Toolique. Explore 270+ free privacy-focused calculators and developer tools." />
  <link rel="canonical" href="${toUrl}" />
  <meta http-equiv="refresh" content="0; url=${toUrl}" />
  <meta name="robots" content="noindex, follow" />
  <meta property="og:title" content="Redirecting to ${label} | Toolique" />
  <meta property="og:description" content="Redirecting to ${label} on Toolique." />
  <meta property="og:url" content="${toUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Redirecting to ${label} | Toolique" />
  <script>
    window.location.replace("${toUrl}");
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px 20px; text-align: center; color: #334155; background: #f8fafc;">
  <div id="root">
    <h1 style="font-size: 1.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 700;">Redirecting to ${label}...</h1>
    <p style="color: #475569; font-size: 1rem; margin-bottom: 16px;">This resource has permanently moved to <a href="${toUrl}" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">${toUrl}</a>.</p>
    <p style="color: #94a3b8; font-size: 0.875rem;">If you are not redirected automatically, click the link above.</p>
  </div>
</body>
</html>`;

  const targetDir = path.join(DIST_DIR, cleanFrom);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
}

// Render tool grid item
function renderToolCardHtml(tool: Tool): string {
  const canonicalPath = getToolCanonicalPath(tool.category, tool.slug);
  return `
    <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
      <div>
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 8px;">
          <a href="/${canonicalPath}" style="color: #0f172a; text-decoration: none;">${tool.name}</a>
        </h3>
        <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 16px; line-height: 1.5;">${tool.shortDescription}</p>
      </div>
      <a href="/${canonicalPath}" style="color: #4f46e5; font-size: 0.875rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
        Open Calculator &rarr;
      </a>
    </article>`;
}

// Render FAQs section
function renderFaqsHtml(faqs: { question: string; answer: string }[]): string {
  if (!faqs || faqs.length === 0) return '';
  return `
    <section style="margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 36px;">
      <h2 style="font-size: 1.6rem; color: #0f172a; margin-bottom: 20px; font-weight: 800;">Frequently Asked Questions</h2>
      <dl style="line-height: 1.8;">
        ${faqs.map(faq => `
          <div style="margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px 22px; border-radius: 10px;">
            <dt style="font-weight: 700; color: #0f172a; font-size: 1.05rem;">${faq.question}</dt>
            <dd style="margin-left: 0; color: #475569; margin-top: 6px; font-size: 0.95rem;">${faq.answer}</dd>
          </div>
        `).join('')}
      </dl>
    </section>`;
}

// ------------------------------------------------------------------------------------------------
// 1. Static Hub Pages with Rich Content
// ------------------------------------------------------------------------------------------------

// QA Hub Page
const qaTargetSlugs = [
  'test-case-generator', 'bug-report-generator', 'boundary-value-analysis',
  'equivalence-partitioning', 'test-data-generator', 'xpath-tester',
  'api-tester', 'json-formatter', 'json-validator', 'json-compare',
  'jwt-decoder', 'regex-tester', 'test-scenario-generator', 'api-response-comparator'
];
const qaTools = toolsList.filter(t => qaTargetSlugs.includes(t.slug) || t.category === 'qa');

const qaFaqs = [
  {
    question: 'What is the difference between Boundary Value Analysis (BVA) and Equivalence Partitioning (EP)?',
    answer: 'Equivalence Partitioning divides input data range classes into valid and invalid groups, assuming all values in a group behave similarly. Boundary Value Analysis focuses on testing the edges (boundaries) of these groups (e.g. min, min-1, max, max+1), as programming errors typically occur at the boundaries.'
  },
  {
    question: 'How do I evaluate XPath and CSS selectors for test automation?',
    answer: 'Use the XPath Tester to write and evaluate element selectors against your HTML layouts. This helps you verify that your Selenium or Playwright locators are unique and target the correct node before writing your test automation scripts.'
  },
  {
    question: 'Why should I perform JSON schema validation locally?',
    answer: 'Validating and formatting JSON schemas client-side prevents sensitive API requests and responses from being sent over the network to external formatting servers, maintaining data privacy in a secure browser sandbox.'
  },
  {
    question: 'How do I decode and verify JWT authorization tokens?',
    answer: 'Use the JWT Decoder to inspect the header and payload signature sections of your bearer authorization tokens. This allows you to verify token expiration timestamps, permissions scopes, and user details in local environments.'
  }
];

const qaBodyHtml = `
  <div id="root">
    <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
        <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <span>QA Workspace</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">QA Testing Case & Mock Data Generators</h1>
      <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">
        Professional browser-based QA automation and manual testing tools. Generate detailed test cases, mock datasets, bug reports, calculate boundary limits, and evaluate XPath selectors securely client-side.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
        ${qaTools.map(renderToolCardHtml).join('')}
      </div>

      ${renderFaqsHtml(qaFaqs)}
    </div>
  </div>`;

const qaSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.toolique.in/qa#collection',
      'name': 'QA Testing Case & Mock Data Generators',
      'description': 'QA automation and manual testing tools. Generate test cases, mock datasets, bug reports, boundary limits, and evaluate XPath selectors.',
      'url': 'https://www.toolique.in/qa',
      'mainEntity': {
        '@type': 'ItemList',
        'name': 'QA Testing Suite Directory',
        'numberOfItems': qaTools.length,
        'itemListElement': qaTools.map((t, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': t.name,
          'url': `https://www.toolique.in/${getToolCanonicalPath(t.category, t.slug)}`
        }))
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.toolique.in/qa#faq',
      'mainEntity': qaFaqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }
  ]
};

// Architecture Hub Page
const archTools = toolsList.filter(t => t.category === 'architecture' || t.category === 'civil' || t.category === 'interior');
const archFaqs = [
  {
    question: 'What is Floor Space Index (FSI) & Floor Area Ratio (FAR)?',
    answer: 'FSI (used in South/West India) and FAR (used in North India) represent the ratio of the total built-up area of a building to the total plot area. Formula: FSI = Total Built-up Area / Plot Area. Permissible FSI depends on local municipal regulations and access road width.'
  },
  {
    question: 'How are building setbacks calculated under NBC India & Unified DCR?',
    answer: 'Building setbacks specify the mandatory open spaces required at the front, rear, and sides of a plot. Under NBC 2016 and state DCR guidelines, front setbacks are determined primarily by the abutting road width, while side and rear setbacks increase with the proposed building height.'
  },
  {
    question: 'How do I calculate concrete, cement, sand, and steel quantities for construction?',
    answer: 'Concrete mix quantities are derived using nominal volume ratios (e.g. M20 1:1.5:3). Multiply the wet concrete volume by 1.54 to convert to dry volume, then divide by the sum of parts to determine cement bags, sand cubic feet/meters, and aggregate requirements.'
  }
];

const archBodyHtml = `
  <div id="root">
    <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
        <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <span>Architecture & Civil Suite</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">Architecture Calculators & Space Planners</h1>
      <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">
        Comprehensive architecture and civil engineering calculation suite. Estimate floor area ratios (FAR/FSI), setback distances, plot coverage, staircase dimensions, civil quantities, and structural material budgets.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
        ${archTools.map(renderToolCardHtml).join('')}
      </div>

      ${renderFaqsHtml(archFaqs)}
    </div>
  </div>`;

const archSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.toolique.in/architecture#collection',
      'name': 'Architecture Calculators & Space Planners',
      'description': 'Estimate floor area ratios (FAR/FSI), setback distances, carpet area, plot area, room sizes, and building clearance codes.',
      'url': 'https://www.toolique.in/architecture',
      'mainEntity': {
        '@type': 'ItemList',
        'name': 'Architecture & Civil Tools Directory',
        'numberOfItems': archTools.length,
        'itemListElement': archTools.map((t, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': t.name,
          'url': `https://www.toolique.in/${getToolCanonicalPath(t.category, t.slug)}`
        }))
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.toolique.in/architecture#faq',
      'mainEntity': archFaqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }
  ]
};

// Developer Hub Page
const devTools = toolsList.filter(t => t.category === 'developer' || t.category === 'web' || t.category === 'security');
const devFaqs = [
  {
    question: 'Are code formatting and token decoding operations secure?',
    answer: 'Yes. All developer formatters, JWT decoders, SQL utilities, and cryptographic hash generators operate 100% client-side in your browser. No source code, payload data, or secret keys are transmitted to any server.'
  },
  {
    question: 'How do I test and debug regular expressions?',
    answer: 'The Regex Tester provides real-time pattern matching with syntax highlighting, group capture extractions, flag toggles (g, i, m, s), and explanation guides for complex expressions.'
  },
  {
    question: 'Can I format and minify SQL queries for production?',
    answer: 'Yes. The SQL Formatter indents complex JOINs, CTEs, subqueries, and window functions for readability, while the SQL Minifier strips unnecessary whitespace and comments for lightweight query payloads.'
  }
];

const devBodyHtml = `
  <div id="root">
    <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
        <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <span>Developer Suite</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">Developer Utilities & Code Formatters</h1>
      <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">
        High-performance developer tools running locally in your browser. Format SQL, beautify JSON, validate XML and YAML, decode JWT signatures, test regex patterns, and encode or decode URL and Base64 strings.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
        ${devTools.map(renderToolCardHtml).join('')}
      </div>

      ${renderFaqsHtml(devFaqs)}
    </div>
  </div>`;

const devSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.toolique.in/developer#collection',
      'name': 'Developer Utilities & Code Formatters',
      'description': 'Online developer utilities. Format SQL, beautify JSON, validate XML/YAML, decode JWT, test regex, and encode/decode URL/base64.',
      'url': 'https://www.toolique.in/developer',
      'mainEntity': {
        '@type': 'ItemList',
        'name': 'Developer Utilities Directory',
        'numberOfItems': devTools.length,
        'itemListElement': devTools.map((t, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': t.name,
          'url': `https://www.toolique.in/${getToolCanonicalPath(t.category, t.slug)}`
        }))
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.toolique.in/developer#faq',
      'mainEntity': devFaqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }
  ]
};

// Calculators Hub Page
const generalCalcTools = toolsList.filter(t => t.category === 'finance' || t.category === 'health' || t.category === 'datetime' || t.category === 'unit' || t.category === 'business');
const calcFaqs = [
  {
    question: 'How does the Indian GST Calculator work?',
    answer: 'The GST Calculator allows you to add or remove GST from any transaction amount across 5%, 12%, 18%, and 28% tax slabs. It automatically breaks down CGST and SGST for intra-state sales or IGST for inter-state transactions.'
  },
  {
    question: 'How is compound interest and SIP returns calculated?',
    answer: 'SIP returns are calculated using the Future Value of an Annuity formula: FV = P × [((1 + i)^n - 1) / i] × (1 + i), where P is monthly investment, i is monthly return rate, and n is total months.'
  }
];

const calcBodyHtml = `
  <div id="root">
    <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
        <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <span>Calculators Hub</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">Free Online Calculators - Finance, Tax, Health & Units</h1>
      <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">
        Explore free online calculators for GST, SIP, EMI, compound interest, income tax, date differences, age, BMI, and general unit conversions. Fast, private, and ad-free.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
        ${generalCalcTools.map(renderToolCardHtml).join('')}
      </div>

      ${renderFaqsHtml(calcFaqs)}
    </div>
  </div>`;

const calcSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.toolique.in/calculators#collection',
      'name': 'Free Online Calculators - Finance, Tax, Health & Units',
      'description': 'Free online calculators for GST, SIP, EMI, compound interest, income tax, date differences, age, BMI, and general calculations.',
      'url': 'https://www.toolique.in/calculators',
      'mainEntity': {
        '@type': 'ItemList',
        'name': 'Calculators Directory',
        'numberOfItems': generalCalcTools.length,
        'itemListElement': generalCalcTools.map((t, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': t.name,
          'url': `https://www.toolique.in/${getToolCanonicalPath(t.category, t.slug)}`
        }))
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.toolique.in/calculators#faq',
      'mainEntity': calcFaqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }
  ]
};

// 3D Printing Studio Hub Page
const threeDTools = toolsList.filter(t => t.category === '3d-printing');
const threeDFaqs = [
  {
    question: 'How do I calculate 3D printing filament cost and selling price?',
    answer: 'Filament cost is calculated by dividing spool price by total spool weight and multiplying by model weight in grams. The selling price adds electricity cost, machine depreciation, labor time, and desired profit markup.'
  },
  {
    question: 'How does STL Volume and Resin Weight estimation work?',
    answer: 'The STL Volume Calculator parses binary and ASCII STL mesh files in your browser using signed tetrahedron volumes to calculate exact displacement in cubic centimeters (cm³) and grams based on material density.'
  }
];

const threeDBodyHtml = `
  <div id="root">
    <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
        <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <span>3D Print Studio</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">3D Printing Cost & Filament Calculators</h1>
      <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">
        Dedicated 3D printing calculator suite for makers and print farms. Calculate filament costs, print pricing, resin volume, Bambu Lab multi-color flush waste, and HueForge layer heights.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
        ${threeDTools.map(renderToolCardHtml).join('')}
      </div>

      ${renderFaqsHtml(threeDFaqs)}
    </div>
  </div>`;

// Math Studio Hub Page
const mathTools = toolsList.filter(t => t.category === 'math-studio');
const mathFaqs = [
  {
    question: 'What math calculators are available in Math Studio?',
    answer: 'Math Studio provides matrix arithmetic solvers, polynomial root finders, derivative and integral calculators, 2D and 3D geometry solvers, descriptive statistics, and probability distribution curves.'
  },
  {
    question: 'Are matrix calculations performed locally in the browser?',
    answer: 'Yes. All matrix determinants, inversions, eigenvalues, and system of linear equations are computed instantly on your device without server latency.'
  }
];

const mathBodyHtml = `
  <div id="root">
    <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
        <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <span>Math Studio</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">Advanced Math Studio & Geometry Solvers</h1>
      <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">
        Explore 22 premium, browser-based calculators covering equation solving, matrix arithmetic, descriptive statistics, 2D/3D geometry, coordinate grids, and probability curves.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
        ${mathTools.map(renderToolCardHtml).join('')}
      </div>

      ${renderFaqsHtml(mathFaqs)}
    </div>
  </div>`;

// Tools Directory Page
const toolsDirectoryBodyHtml = `
  <div id="root">
    <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
        <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <span>Tools Directory</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">Free Online Tools & Professional Calculators</h1>
      <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">
        Find the right tool instantly. Browse our complete directory of 270+ free online developer tools, financial calculators, unit converters, civil estimators, and text utilities.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
        ${toolsList.map(renderToolCardHtml).join('')}
      </div>
    </div>
  </div>`;

// Static Pages Map
const staticPages = [
  {
    path: '404',
    title: '404 - Page Not Found | Toolique',
    description: 'The requested page could not be found on Toolique. Search our 270+ free online calculators and developer tools.',
    keywords: ['404', 'page not found', 'toolique']
  },
  {
    path: 'about',
    title: 'About Us | Toolique',
    description: 'Learn more about Toolique - our mission to provide high-quality, privacy-focused calculators and developer tools.',
    keywords: ['about toolique', 'online tools info', 'calculators mission']
  },
  {
    path: 'contact',
    title: 'Contact Us | Toolique',
    description: 'Get in touch with Toolique. Suggest a new tool, report a bug, or send us feedback.',
    keywords: ['contact toolique', 'suggest calculator', 'report bug']
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy | Toolique',
    description: 'Your privacy is our priority. Read our privacy policy to understand how we keep all your calculations local and secure.',
    keywords: ['privacy policy', 'data safety', 'local storage tools']
  },
  {
    path: 'terms-conditions',
    title: 'Terms & Conditions | Toolique',
    description: 'Read the terms and conditions for using the Toolique platform.',
    keywords: ['terms and conditions', 'calculator usage terms']
  },
  {
    path: 'disclaimer',
    title: 'Disclaimer | Toolique',
    description: 'Read our disclaimer regarding the accuracy and usage of calculations on Toolique.',
    keywords: ['disclaimer', 'calculator accuracy notice']
  },
  {
    path: 'math-studio',
    title: 'Advanced Math Studio | Toolique',
    description: 'Explore 22 premium, browser-based calculators covering equation solving, matrix arithmetic, descriptive statistics, 2D/3D geometry, coordinate grids, and probability curves.',
    keywords: ['math studio', 'matrix solver', 'calculus calculator'],
    bodyHtml: mathBodyHtml
  },
  {
    path: '3d-print-studio',
    title: '3D Print Studio | Toolique',
    description: 'Free 3D printing calculators for filament cost, print pricing, resin, print farms, Bambu Lab, HueForge, STL volume, electricity cost, and print profit.',
    keywords: ['3d printing calculator', 'filament cost', 'maker tools'],
    bodyHtml: threeDBodyHtml
  },
  {
    path: '3d-printing',
    title: '3D Printing cost & filament calculators | Toolique',
    description: 'Dedicated 3D printing calculator tools for cost calculations, filament weight estimation, AMS slot planning, and resin volumes.',
    keywords: ['3d printing cost', 'filament calculator', 'maker settings'],
    bodyHtml: threeDBodyHtml
  },
  {
    path: 'calculators',
    title: 'Free Online Calculators - Finance, Age, Tax, BMI | Toolique',
    description: 'Free online calculators for GST, SIP, EMI, compound interest, income tax, date differences, age, BMI, and general calculations.',
    keywords: ['calculators', 'free calculators', 'gst calculator', 'sip calculator', 'emi calculator', 'age calculator'],
    schemaMarkup: calcSchema,
    bodyHtml: calcBodyHtml
  },
  {
    path: 'architecture',
    title: 'Architecture Calculators & Space Planners | Toolique',
    description: 'Estimate floor area ratios (FAR/FSI), setback distances, carpet area, plot area, room sizes, and building clearance codes.',
    keywords: ['architecture calculators', 'far calculator', 'setback calculator', 'carpet area calculator'],
    schemaMarkup: archSchema,
    bodyHtml: archBodyHtml
  },
  {
    path: 'developer',
    title: 'Developer Utilities & Code Formatters | Toolique',
    description: 'Online developer utilities. Format SQL, beautify JSON, validate XML/YAML, decode JWT, test regex, and encode/decode URL/base64.',
    keywords: ['developer tools', 'json formatter', 'sql formatter', 'jwt decoder', 'uuid generator'],
    schemaMarkup: devSchema,
    bodyHtml: devBodyHtml
  },
  {
    path: 'qa',
    title: 'QA Testing Case & Mock Data Generators | Toolique',
    description: 'QA automation and manual testing tools. Generate test cases, mock datasets, bug reports, boundary limits, and evaluate XPath selectors.',
    keywords: ['qa tools', 'test case generator', 'bug report generator', 'test data generator', 'xpath tester'],
    schemaMarkup: qaSchema,
    bodyHtml: qaBodyHtml
  },
  {
    path: 'about-founder',
    title: 'About Ajinkya Swami | Founder of Toolique & Voxelique',
    description: 'Meet Ajinkya Swami, founder of Toolique and Voxelique. Learn about his experience in QA Automation, software development, engineering tools, 3D printing, and his mission to build high-quality free online tools.',
    keywords: ['Ajinkya Swami', 'Toolique Founder', 'Voxelique Founder', 'QA Automation Engineer', '3D Printing cost calculator', 'About Ajinkya'],
    schemaMarkup: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          '@id': 'https://www.toolique.in/about-founder#breadcrumb',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.toolique.in/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'About Founder', 'item': 'https://www.toolique.in/about-founder' }
          ]
        },
        {
          '@type': 'Person',
          '@id': 'https://www.toolique.in/about-founder#person',
          'name': 'Ajinkya Swami',
          'jobTitle': 'QA Automation Engineer & Full-Stack Builder',
          'url': 'https://www.toolique.in/about-founder',
          'image': 'https://www.toolique.in/favicon-512x512.png',
          'sameAs': [
            'https://github.com/ajinkyaswami1999',
            'https://www.linkedin.com/in/ajinkya-swami-82751b191/',
            'https://www.instagram.com/ajinkyaswami.in/',
            'https://voxelique.com',
            'https://www.instagram.com/voxelique/'
          ],
          'worksFor': [
            { '@type': 'Organization', 'name': 'Toolique', 'url': 'https://www.toolique.in' },
            { '@type': 'Organization', 'name': 'Voxelique', 'url': 'https://voxelique.com' }
          ]
        },
        {
          '@type': 'Organization',
          '@id': 'https://www.toolique.in/#organization',
          'name': 'Toolique',
          'url': 'https://www.toolique.in',
          'logo': 'https://www.toolique.in/favicon-512x512.png',
          'founder': { '@type': 'Person', 'name': 'Ajinkya Swami' }
        },
        {
          '@type': 'Organization',
          '@id': 'https://voxelique.com/#organization',
          'name': 'Voxelique',
          'url': 'https://voxelique.com',
          'founder': { '@type': 'Person', 'name': 'Ajinkya Swami' }
        }
      ]
    }
  },
  {
    path: 'academy',
    title: 'Toolique Academy | Learn Programming & QA Interview Prep',
    description: 'Practice programming, software engineering, QA automation, and technical interview questions with dynamic daily challenges and progress tracking.',
    keywords: ['programming academy', 'interview prep', 'qa automation', 'coding challenges']
  },
  {
    path: 'academy/bookmarks',
    title: 'Saved Challenges & Notes | Toolique Academy',
    description: 'Review your bookmarked technical interview questions, coding challenges, and export your personal scratch notes.',
    keywords: ['saved coding questions', 'bookmark interview prep', 'code notes']
  },
  {
    path: 'academy/learn',
    title: 'Visual Explainers & Learn Path | Toolique Academy',
    description: 'Master programming concepts visually. Explore interactive visualizers for SQL JOINs, Stacks, Queues, and Linked Lists.',
    keywords: ['sql join visualizer', 'data structures visualization', 'visual coding explainers']
  },
  {
    path: 'academy/playgrounds',
    title: 'Interactive Playgrounds Sandbox | Toolique Academy',
    description: 'Write and execute SQL queries, JavaScript scripts, and Python code in the browser with full console output logs.',
    keywords: ['sql playground', 'javascript playground', 'python sandbox', 'online code editor']
  },
  {
    path: 'ai',
    title: 'AI Studio | Toolique',
    description: 'Evolve your developer and QA workflows. Use browser-sandboxed AI models to generate SQL queries, test validation cases, and regex patterns instantly.',
    keywords: ['ai studio', 'ai sql generator', 'ai test case generator', 'ai regex generator']
  },
  {
    path: 'playground',
    title: 'Interactive Developer Playground | Toolique',
    description: 'Write, format, lint, and run JavaScript, JSON parsing lists, Python scripts, or send REST API calls directly from a premium sandboxed web client.',
    keywords: ['developer playground', 'online ide', 'javascript runner', 'rest client']
  },
  {
    path: 'blog',
    title: 'Knowledge Base & Resources | Toolique',
    description: 'Explore technical articles, developer roadmap explainers, and comprehensive calculation guides linked back to browser-based playgrounds and tools.',
    keywords: ['developer blog', 'sql joins guide', '3d printing pricing guide', 'gst calculator explanation']
  },
  {
    path: 'dashboard',
    title: 'Local User Profile & Dashboard | Toolique',
    description: 'Monitor your developer academy progress, bookmarks list, coding challenge history logs, and manage local notes and backup exports without registration.',
    keywords: ['user dashboard', 'local profile', 'developer progress tracking']
  },
  {
    path: 'tools',
    title: 'Free Online Tools & Professional Calculators | Toolique',
    description: 'Find the right tool instantly. Browse our complete directory of free online developer tools, financial calculators, unit converters, civil estimators, and text utilities.',
    keywords: ['online tools', 'free calculators', 'developer tools', 'utility directory'],
    bodyHtml: toolsDirectoryBodyHtml,
    schemaMarkup: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': 'https://www.toolique.in/tools#collection',
          'name': 'Free Online Tools & Professional Calculators',
          'description': 'Browse our complete directory of free online developer tools, financial calculators, unit converters, civil estimators, and text utilities.',
          'url': 'https://www.toolique.in/tools',
          'about': {
            '@type': 'ItemList',
            'name': 'Toolique Product Catalog',
            'itemListElement': toolsList.slice(0, 25).map((t, idx) => ({
              '@type': 'ListItem',
              'position': idx + 1,
              'url': `https://www.toolique.in/${getToolCanonicalPath(t.category, t.slug)}`,
              'name': t.name
            }))
          }
        }
      ]
    }
  }
];

// Generate static pages
staticPages.forEach((page) => {
  generateShell(page.path, page.title, page.description, page.keywords, (page as any).schemaMarkup, (page as any).bodyHtml);
});

// ------------------------------------------------------------------------------------------------
// 2. Generate Individual Tool Pages
// ------------------------------------------------------------------------------------------------
toolsList.forEach((tool) => {
  const routePath = getToolCanonicalPath(tool.category, tool.slug);

  const title = tool.metaTitle || `${tool.name} | Toolique`;
  const description = tool.metaDescription || tool.shortDescription;
  const toolUrl = `https://www.toolique.in/${routePath}`;

  const categoryObj = categories.find(c => c.id === tool.category);
  const catName = categoryObj ? categoryObj.name : tool.category;

  // Build BreadcrumbList based on category
  let breadcrumbItems: object[];
  if (tool.category === '3d-printing') {
    breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.toolique.in/' },
      { '@type': 'ListItem', position: 2, name: '3D Print Studio', item: 'https://www.toolique.in/3d-print-studio' },
      { '@type': 'ListItem', position: 3, name: tool.name, item: toolUrl },
    ];
  } else if (tool.category === 'math-studio') {
    breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.toolique.in/' },
      { '@type': 'ListItem', position: 2, name: 'Math Studio', item: 'https://www.toolique.in/math-studio' },
      { '@type': 'ListItem', position: 3, name: tool.name, item: toolUrl },
    ];
  } else {
    breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.toolique.in/' },
      { '@type': 'ListItem', position: 2, name: catName, item: `https://www.toolique.in/${getCategoryCanonicalPath(tool.category)}` },
      { '@type': 'ListItem', position: 3, name: tool.name, item: toolUrl },
    ];
  }

  // Build structured schema markup
  const toolSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${toolUrl}#breadcrumb`,
        'itemListElement': breadcrumbItems
      },
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        '@id': `${toolUrl}#webapp`,
        'name': tool.name,
        'url': toolUrl,
        'description': tool.shortDescription,
        'applicationCategory': tool.category === 'finance'
          ? 'FinanceApplication'
          : tool.category === 'developer'
          ? 'DeveloperApplication'
          : tool.category === '3d-printing'
          ? 'DesignApplication'
          : 'UtilityApplication',
        'operatingSystem': 'Web Browser',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'softwareVersion': '2.0.0',
        'isAccessibleForFree': true,
        'featureList': 'Browser-based interactive calculations, real-time validations, and clean ad-free reports.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'reviewCount': '128'
        }
      },
      ...(tool.howToUse && tool.howToUse.length > 0 ? [{
        '@type': 'HowTo',
        '@id': `${toolUrl}#howto`,
        'name': `How to use ${tool.name}`,
        'step': tool.howToUse.map((stepText, index) => ({
          '@type': 'HowToStep',
          'position': index + 1,
          'text': stepText
        }))
      }] : []),
      ...(tool.faqs && tool.faqs.length > 0 ? [{
        '@type': 'FAQPage',
        '@id': `${toolUrl}#faq`,
        'mainEntity': tool.faqs.map(faq => ({
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

  // Rich indexable HTML content for Search Engines (SEO), Answer Engines (AEO) & LLM Crawlers (GEO)
  const howToHtml = (tool.howToUse && tool.howToUse.length > 0)
    ? `<section style="margin-top: 30px;">
        <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 14px; font-weight: 700;">How to Use ${tool.name}</h2>
        <ol style="padding-left: 22px; line-height: 1.8; color: #334155;">
          ${tool.howToUse.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
        </ol>
      </section>`
    : '';

  const faqsHtml = (tool.faqs && tool.faqs.length > 0)
    ? `<section style="margin-top: 35px;">
        <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 14px; font-weight: 700;">Frequently Asked Questions</h2>
        <dl style="line-height: 1.8;">
          ${tool.faqs.map(faq => `
            <dt style="font-weight: 700; color: #0f172a; margin-top: 16px; font-size: 1.05rem;">${faq.question}</dt>
            <dd style="margin-left: 0; color: #475569; margin-top: 4px; font-size: 0.95rem;">${faq.answer}</dd>
          `).join('')}
        </dl>
      </section>`
    : '';

  const sectionsHtml = (tool.sections && tool.sections.length > 0)
    ? `<section style="margin-top: 35px;">
        ${tool.sections.map(sec => `
          <article style="margin-bottom: 24px;">
            <h2 style="font-size: 1.4rem; color: #1e293b; margin-bottom: 10px; font-weight: 700;">${sec.title}</h2>
            <div style="color: #475569; line-height: 1.7; font-size: 0.95rem; white-space: pre-line;">${sec.content}</div>
          </article>
        `).join('')}
      </section>`
    : '';

  const toolBodyHtml = `
    <div id="root">
      <div style="padding: 40px 20px; max-width: 900px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
          <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
          <a href="/${getCategoryCanonicalPath(tool.category)}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${catName}</a> &gt; 
          <span>${tool.name}</span>
        </nav>
        <h1 style="font-size: 2.4rem; margin-bottom: 12px; color: #0f172a; font-weight: 800; line-height: 1.25;">${title.split(' – ')[0].split(' | ')[0]}</h1>
        <p style="font-size: 1.125rem; color: #475569; margin-bottom: 24px; line-height: 1.6;">${description}</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; margin-bottom: 28px;">
          <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 1.05rem;">⚡ Interactive Calculation Engine Active</p>
          <p style="margin: 6px 0 0 0; color: #64748b; font-size: 0.925rem;">Please enable JavaScript in your browser to run live computations, 2D envelope diagrams, and export PDF reports.</p>
        </div>
        ${howToHtml}
        ${sectionsHtml}
        ${faqsHtml}
      </div>
    </div>`;

  generateShell(routePath, title, description, tool.keywords || [], toolSchema, toolBodyHtml);
});

// ------------------------------------------------------------------------------------------------
// 3. Generate Category Landing Pages (tools/:category)
// ------------------------------------------------------------------------------------------------
categories.forEach((cat) => {
  const routePath = `tools/${cat.id}`;
  const title = `${cat.name} Tools & Free Online Calculators | Toolique`;
  const description = cat.description;
  const keywords = [cat.name, `${cat.name.toLowerCase()} calculators`, 'online tools'];
  
  const categoryTools = toolsList.filter(t => t.category === cat.id);

  const catBodyHtml = `
    <div id="root">
      <div style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 16px; font-size: 0.875rem; color: #64748b;">
          <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Home</a> &gt; 
          <a href="/tools" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Tools Directory</a> &gt; 
          <span>${cat.name}</span>
        </nav>
        <h1 style="font-size: 2.5rem; margin-bottom: 12px; color: #0f172a; font-weight: 800;">${cat.name} Calculators & Tools</h1>
        <p style="font-size: 1.15rem; color: #475569; margin-bottom: 32px; line-height: 1.6;">${cat.description}</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
          ${categoryTools.map(renderToolCardHtml).join('')}
        </div>
      </div>
    </div>`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `https://www.toolique.in/${routePath}#collection`,
        'name': `${cat.name} Calculators & Tools`,
        'description': cat.description,
        'url': `https://www.toolique.in/${routePath}`,
        'mainEntity': {
          '@type': 'ItemList',
          'name': `${cat.name} Tools`,
          'numberOfItems': categoryTools.length,
          'itemListElement': categoryTools.map((t, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': t.name,
            'url': `https://www.toolique.in/${getToolCanonicalPath(t.category, t.slug)}`
          }))
        }
      }
    ]
  };

  generateShell(routePath, title, description, keywords, schema, catBodyHtml);
});

// ------------------------------------------------------------------------------------------------
// 4. Generate Academy Pages
// ------------------------------------------------------------------------------------------------
academyCategories.forEach((cat) => {
  const routePath = `academy/${cat.id}`;
  const title = `${cat.name} | Toolique Academy`;
  const description = cat.description;
  const keywords = cat.topics || [];
  
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `https://www.toolique.in/${routePath}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.toolique.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Academy', 'item': 'https://www.toolique.in/academy' },
          { '@type': 'ListItem', 'position': 3, 'name': cat.name, 'item': `https://www.toolique.in/${routePath}` }
        ]
      }
    ]
  };

  generateShell(routePath, title, description, keywords, schema);
});

const academyQuestions = [
  ...sqlQuestions,
  ...pythonQuestions,
  ...javascriptQuestions,
  ...reactQuestions,
  ...qaQuestions
];

academyQuestions.forEach((q) => {
  const categoryId = q.id.startsWith('sql') ? 'sql' : q.id.startsWith('py') ? 'python' : q.id.startsWith('js') ? 'javascript' : q.id.startsWith('react') ? 'react' : 'qa';
  const category = academyCategories.find(c => c.id === categoryId);
  const routePath = `academy/${categoryId}/question/${q.slug}`;
  const title = `${q.title} | ${category ? category.name : 'Academy'} Question`;
  const description = `Solve the challenge: ${q.title}. Category: ${q.topic}. Practice technical questions with step-by-step solutions.`;
  const keywords = q.tags || [];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `https://www.toolique.in/${routePath}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.toolique.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Academy', 'item': 'https://www.toolique.in/academy' },
          { '@type': 'ListItem', 'position': 3, 'name': category ? category.name : 'Track', 'item': `https://www.toolique.in/academy/${categoryId}` },
          { '@type': 'ListItem', 'position': 4, 'name': q.title, 'item': `https://www.toolique.in/${routePath}` }
        ]
      },
      {
        '@type': 'TechArticle',
        '@id': `https://www.toolique.in/${routePath}#article`,
        'headline': q.title,
        'description': q.question,
        'dependencies': q.topic,
        'proficiencyLevel': q.difficulty
      },
      {
        '@type': 'FAQPage',
        '@id': `https://www.toolique.in/${routePath}#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `How to solve: ${q.title}?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': q.explanation
            }
          }
        ]
      }
    ]
  };

  generateShell(routePath, title, description, keywords, schema);
});

// ------------------------------------------------------------------------------------------------
// 5. Generate Static Redirect Shells for Legacy URLs (/tool/:slug, /tools/:slug, aliases)
// ------------------------------------------------------------------------------------------------
console.log('Generating static redirect shells for legacy URLs...');
const categoryIdsSet = new Set(categories.map(c => c.id));

toolsList.forEach((tool) => {
  const canonicalPath = getToolCanonicalPath(tool.category, tool.slug);

  // 1. /tool/:slug -> canonical
  generateRedirectShell(`tool/${tool.slug}`, canonicalPath, tool.name);

  // 2. /tools/:slug -> canonical (if not a category slug)
  if (!categoryIdsSet.has(tool.slug)) {
    generateRedirectShell(`tools/${tool.slug}`, canonicalPath, tool.name);
  }

  // 3. /3d-printing/:slug -> /calculators/:slug (if category is 3d-printing)
  if (tool.category === '3d-printing' && canonicalPath.startsWith('calculators/')) {
    generateRedirectShell(`3d-printing/${tool.slug}`, canonicalPath, tool.name);
  }

  // 4. /math-studio/:slug -> /calculators/:slug (if category is math-studio)
  if (tool.category === 'math-studio' && canonicalPath.startsWith('calculators/')) {
    generateRedirectShell(`math-studio/${tool.slug}`, canonicalPath, tool.name);
  }
});

// Standalone Legacy Aliases Redirects
generateRedirectShell('civil', 'architecture', 'Architecture & Civil Suite');
generateRedirectShell('architecture-tools', 'architecture', 'Architecture Suite');
generateRedirectShell('qa-tools', 'qa', 'QA Workspace');
generateRedirectShell('finance-tools', 'calculators', 'Finance Calculators');
generateRedirectShell('developer-tools', 'developer', 'Developer Suite');
generateRedirectShell('tools/filament-art-maker', 'calculators/filament-art-maker', 'Filament Art Maker');
generateRedirectShell('3d-printing/filament-art-maker', 'calculators/filament-art-maker', 'Filament Art Maker');
generateRedirectShell('tools/image-to-filament-art-maker', 'calculators/filament-art-maker', 'Image to Filament Art Maker');
generateRedirectShell('3d-printing/image-to-filament-art-maker', 'calculators/filament-art-maker', 'Image to Filament Art Maker');
generateRedirectShell('tools/advanced-boq-calculator-india', 'civil/advanced-boq-calculator-india', 'Advanced BOQ Calculator India');

console.log('SEO pre-rendering shells generation complete!');

// ------------------------------------------------------------------------------------------------
// 6. Programmatic XML Sitemap Generator
// ------------------------------------------------------------------------------------------------
function generateXmlSitemap() {
  console.log('Compiling programmatic sitemap.xml...');
  const todayStr = new Date().toISOString().split('T')[0];

  const urls: { loc: string; changefreq: string; priority: string }[] = [];

  // 1. Add Homepage
  urls.push({ loc: 'https://www.toolique.in/', changefreq: 'daily', priority: '1.0' });

  // 2. Add static pages (excluding 404)
  staticPages.filter(p => p.path !== '404').forEach(p => {
    let priority = '0.5';
    let freq = 'monthly';
    if (['qa', 'architecture', 'developer', 'calculators', 'tools', 'academy'].includes(p.path)) {
      priority = '0.95';
      freq = 'daily';
    } else if (p.path === 'about-founder' || p.path === '3d-print-studio' || p.path === 'math-studio') {
      priority = '0.85';
      freq = 'weekly';
    } else if (p.path.startsWith('academy/')) {
      priority = '0.8';
      freq = 'weekly';
    } else if (['3d-printing'].includes(p.path)) {
      priority = '0.9';
      freq = 'weekly';
    }
    urls.push({ loc: `https://www.toolique.in/${p.path}`, changefreq: freq, priority });
  });

  // 3. Add dynamic tools
  toolsList.forEach(t => {
    const canonicalPath = getToolCanonicalPath(t.category, t.slug).replace(/^\/+/, '');
    let priority = '0.8';
    let freq = 'weekly';

    // Flagship Hero Tool: Building Feasibility Checker gets maximum 1.0 priority and daily crawling
    if (t.id === 'BuildingFeasibilityChecker' || t.slug === 'building-feasibility-checker') {
      priority = '1.0';
      freq = 'daily';
    }
    urls.push({ loc: `https://www.toolique.in/${canonicalPath}`, changefreq: freq, priority });
  });

  // 4. Add academy categories
  academyCategories.forEach(cat => {
    urls.push({ loc: `https://www.toolique.in/academy/${cat.id}`, changefreq: 'weekly', priority: '0.7' });
  });

  // Add tools categories landing pages
  categories.forEach(cat => {
    urls.push({ loc: `https://www.toolique.in/tools/${cat.id}`, changefreq: 'weekly', priority: '0.7' });
  });

  // 5. Add academy questions
  academyQuestions.forEach(q => {
    const categoryId = q.id.startsWith('sql') ? 'sql' : q.id.startsWith('py') ? 'python' : q.id.startsWith('js') ? 'javascript' : q.id.startsWith('react') ? 'react' : 'qa';
    urls.push({ loc: `https://www.toolique.in/academy/${categoryId}/question/${q.slug}`, changefreq: 'weekly', priority: '0.6' });
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xmlContent, 'utf8');
  fs.writeFileSync(path.resolve('public/sitemap.xml'), xmlContent, 'utf8');
  console.log(`Programmatic sitemap.xml generated successfully in dist/ and public/! (${urls.length} URLs compiled)`);
}

generateXmlSitemap();

// Sync public static files to dist/
['robots.txt', 'llms.txt', 'llms-full.txt'].forEach(file => {
  const src = path.resolve('public', file);
  const dest = path.join(DIST_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Synced ${file} to dist/`);
  }
});

// Copy 404 shell to root dist/404.html for host routing
const shell404 = path.join(DIST_DIR, '404', 'index.html');
if (fs.existsSync(shell404)) {
  fs.copyFileSync(shell404, path.join(DIST_DIR, '404.html'));
  console.log('Synced 404.html to dist/ root');
}
