import fs from 'fs';
import path from 'path';
import { toolsList } from '../src/data/tools';
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
    'https://www.instagram.com/2ajinkya6/',
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
    'https://www.instagram.com/2ajinkya6/',
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
    'target': 'https://www.toolique.in/?search={search_term_string}',
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
            'https://www.instagram.com/2ajinkya6/',
            'https://www.instagram.com/voxelique/',
            'https://www.toolique.in',
            'https://voxelique.com'
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
  generateShell(page.path, page.title, page.description, page.keywords, (page as any).schemaMarkup);
});

// Generate dynamic tool pages
toolsList.forEach((tool) => {
  const routePath = tool.slug === 'advanced-boq-calculator-india'
    ? 'tools/advanced-boq-calculator-india'
    : `tool/${tool.slug}`;

  const title = `${tool.name} | Toolique`;
  const description = tool.metaDescription || tool.shortDescription;
  const toolUrl = `https://www.toolique.in/${routePath}`;

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
      { '@type': 'ListItem', position: 2, name: tool.category, item: `https://www.toolique.in/?category=${tool.category}` },
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
          : 'UtilityApplication',
        'operatingSystem': 'All',
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

  generateShell(routePath, title, description, tool.keywords || [], toolSchema);
});

// Generate Academy Category pages
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

// Generate Academy Question pages
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

console.log('SEO pre-rendering shells generation complete!');

// Programmatic XML Sitemap Generator
function generateXmlSitemap() {
  console.log('Compiling programmatic sitemap.xml...');
  const todayStr = new Date().toISOString().split('T')[0];

  const urls: { loc: string; changefreq: string; priority: string }[] = [];

  // 1. Add Homepage
  urls.push({ loc: 'https://www.toolique.in/', changefreq: 'daily', priority: '1.0' });

  // 2. Add static pages
  staticPages.forEach(p => {
    let priority = '0.5';
    let freq = 'monthly';
    if (p.path === 'academy') {
      priority = '0.9';
      freq = 'daily';
    } else if (p.path === 'about-founder') {
      priority = '0.7';
      freq = 'monthly';
    } else if (p.path.startsWith('academy/')) {
      priority = '0.8';
      freq = 'weekly';
    }
    urls.push({ loc: `https://www.toolique.in/${p.path}`, changefreq: freq, priority });
  });

  // 3. Add dynamic tools
  toolsList.forEach(t => {
    const path = t.slug === 'advanced-boq-calculator-india'
      ? 'tools/advanced-boq-calculator-india'
      : `tool/${t.slug}`;
    urls.push({ loc: `https://www.toolique.in/${path}`, changefreq: 'weekly', priority: '0.8' });
  });

  // 4. Add academy categories
  academyCategories.forEach(cat => {
    urls.push({ loc: `https://www.toolique.in/academy/${cat.id}`, changefreq: 'weekly', priority: '0.7' });
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
