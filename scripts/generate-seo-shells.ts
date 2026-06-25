import fs from 'fs';
import path from 'path';
import { toolsList } from '../src/data/tools';

const DIST_DIR = path.resolve('dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('Build template not found at dist/index.html. Run npm run build first.');
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

const staticPages = [
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
    keywords: ['math studio', 'matrix solver', 'calculus calculator']
  },
  {
    path: '3d-print-studio',
    title: '3D Print Studio | Toolique',
    description: 'Free 3D printing calculators for filament cost, print pricing, resin, print farms, Bambu Lab, HueForge, STL volume, electricity cost, and print profit.',
    keywords: ['3d printing calculator', 'filament cost', 'maker tools']
  }
];

// Helper to write static pre-rendered shell
function generateShell(
  routePath: string,
  title: string,
  description: string,
  keywords: string[],
  schemaMarkup?: object
) {
  const fullUrl = `https://www.toolique.in/${routePath}`;
  let html = template;

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

  // 3. Replace Twitter tags
  html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
  html = html.replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${fullUrl}" />`);

  // 4. Inject JSON-LD Schema
  if (schemaMarkup) {
    const schemaScript = `
    <!-- JSON-LD Structured Data for this specific page -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaMarkup, null, 2)}
    </script>
  </head>`;
    html = html.replace('</head>', schemaScript);
  }

  // 5. Populate body loading state with indexable HTML content
  const rootContent = `
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
  html = html.replace('<div id="root"></div>', rootContent);

  // Write file
  const targetDir = path.join(DIST_DIR, routePath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  console.log(`Generated SEO shell: ${routePath}/index.html`);
}

// Generate static pages
staticPages.forEach((page) => {
  generateShell(page.path, page.title, page.description, page.keywords);
});

// Generate dynamic tool pages
toolsList.forEach((tool) => {
  const routePath = tool.slug === 'advanced-boq-calculator-india'
    ? 'tools/advanced-boq-calculator-india'
    : `tool/${tool.slug}`;

  const title = `${tool.name} | Toolique`;
  const description = tool.metaDescription || tool.shortDescription;

  // Build structured schema markup
  const toolSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://www.toolique.in/${routePath}#webapp`,
        'name': tool.name,
        'url': `https://www.toolique.in/${routePath}`,
        'description': tool.shortDescription,
        'applicationCategory': tool.category === 'finance' ? 'FinanceApplication' : tool.category === 'developer' ? 'DeveloperApplication' : 'UtilityApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.'
      },
      ...(tool.howToUse && tool.howToUse.length > 0 ? [{
        '@type': 'HowTo',
        '@id': `https://www.toolique.in/${routePath}#howto`,
        'name': `How to use ${tool.name}`,
        'step': tool.howToUse.map((stepText, index) => ({
          '@type': 'HowToStep',
          'position': index + 1,
          'text': stepText
        }))
      }] : []),
      ...(tool.faqs && tool.faqs.length > 0 ? [{
        '@type': 'FAQPage',
        '@id': `https://www.toolique.in/${routePath}#faq`,
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

  generateShell(routePath, title, description, tool.keywords || [], toolSchema);
});

console.log('SEO pre-rendering shells generation complete!');
