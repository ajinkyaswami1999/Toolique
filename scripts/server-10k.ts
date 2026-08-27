import http from 'http';
import url from 'url';

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '';

  if (pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`User-agent: *
Disallow: /private/
Disallow: /disallowed/
`);
    return;
  }

  if (pathname === '/sitemap.xml') {
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let i = 0; i < 10000; i++) {
      xml += `\n  <url><loc>http://127.0.0.1:${PORT}/page-${i}</loc></url>`;
    }
    xml += '\n</urlset>';
    res.end(xml);
    return;
  }

  if (pathname.startsWith('/private/')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>Private Area</title></head><body>This should be blocked by robots.txt</body></html>');
    return;
  }

  if (pathname === '/page-broken') {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>404 Not Found</title></head><body>Broken Link Page</body></html>');
    return;
  }

  if (pathname === '/page-50') {
    // 301 Permanent Redirect to page-100
    res.writeHead(301, { 'Location': `/page-100` });
    res.end();
    return;
  }

  if (pathname === '/page-70') {
    // 500 Server Error
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>500 Internal Error</title></head><body>Server Error Page</body></html>');
    return;
  }

  if (pathname === '/page-80') {
    // Latency simulator (1.2 seconds) to test timeouts
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><head><title>Slow Page</title></head><body>Loaded slow</body></html>');
    }, 1200);
    return;
  }

  const match = pathname.match(/^\/page-(\d+)$/);
  if (match) {
    const id = parseInt(match[1], 10);
    if (id < 0 || id >= 10000) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<html><body>Out of range</body></html>');
      return;
    }

    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'X-Robots-Tag': id === 40 ? 'noindex, nofollow' : 'index, follow'
    });

    let head = '';
    if (id !== 90) {
      head += `<title>Toolique Test Page ${id}</title>`;
    }
    head += `<meta name="description" content="Description for page ${id}. This is a stress testing webpage to run high scale crawls.">`;
    head += `<link rel="canonical" href="http://127.0.0.1:${PORT}/page-${id}">`;
    head += `<link rel="stylesheet" href="/assets/style-${id}.css">`;
    head += `<script src="/assets/script-${id}.js"></script>`;

    if (id % 10 === 0) {
      head += `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Toolique Page ${id}",
        "description": "JSON-LD schema test"
      }
      </script>`;
    }

    let body = `<h1>Welcome to Page ${id}</h1>`;
    body += `<img src="/images/logo-${id}.png" alt="Logo for page ${id}">`;

    // Children links (10-ary search tree of depth 4)
    const children: number[] = [];
    if (id < 1111) {
      const start = id * 10 + 1;
      const end = Math.min(id * 10 + 10, 9999);
      for (let c = start; c <= end; c++) {
        children.push(c);
      }
    }

    children.forEach(c => {
      body += `\n<a href="/page-${c}">Link to child Page ${c}</a>`;
    });

    if (id === 10) {
      body += `\n<a href="/private/secret-page">Disallowed Secret Link</a>`;
    }
    if (id === 60) {
      body += `\n<a href="/page-broken">Broken Link 404</a>`;
    }

    // Add some random backlinks to increase cross-links density
    if (id > 0 && id % 15 === 0) {
      body += `\n<a href="/page-${id % 7}">Cross Link Back</a>`;
    }

    res.end(`<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`);
    return;
  }

  if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
    res.writeHead(200, { 
      'Content-Type': pathname.endsWith('.js') ? 'application/javascript' : pathname.endsWith('.css') ? 'text/css' : 'image/png' 
    });
    res.end('/* Dummy Asset content */');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Test 10k server running at http://127.0.0.1:${PORT}`);
});
