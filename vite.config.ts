import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath, type Connect } from 'vite';

const sourceDirectory = fileURLToPath(new URL('./src/', import.meta.url));
const homeEntry = fileURLToPath(new URL('./src/home/index.html', import.meta.url));
const homeMetadata = fileURLToPath(new URL('./src/home/metadata.json', import.meta.url));

interface HomeMetadata {
  title: string;
  author: string;
  description: string;
  url: string;
  type: string;
  image: {
    url: string;
    width: number;
    height: number;
    type: string;
  };
  twitterCard: string;
}

function escapeHtml(value: string | number): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderHomeMetadata(): string {
  const metadata: HomeMetadata = JSON.parse(readFileSync(homeMetadata, 'utf8'));
  const meta = (attribute: 'name' | 'property', key: string, value: string | number) =>
    `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;

  return [
    `<title>${escapeHtml(metadata.title)}</title>`,
    meta('name', 'author', metadata.author),
    meta('name', 'description', metadata.description),
    `<link rel="canonical" href="${escapeHtml(metadata.url)}" />`,
    meta('property', 'og:type', metadata.type),
    meta('property', 'og:url', metadata.url),
    meta('property', 'og:title', metadata.title),
    meta('property', 'og:description', metadata.description),
    meta('property', 'og:image', metadata.image.url),
    meta('property', 'og:image:width', metadata.image.width),
    meta('property', 'og:image:height', metadata.image.height),
    meta('property', 'og:image:type', metadata.image.type),
    meta('property', 'og:image:alt', metadata.title),
    meta('name', 'twitter:card', metadata.twitterCard),
    meta('name', 'twitter:title', metadata.title),
    meta('name', 'twitter:description', metadata.description),
    meta('name', 'twitter:image', metadata.image.url),
    meta('name', 'twitter:image:alt', metadata.title),
  ].join('\n    ');
}

function expandHtmlIncludes(html: string, activeIncludes = new Set<string>()): string {
  return html.replace(/<!--\s*include:\s*(.*?)\s*-->/g, (_, path: string) => {
    if (!/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.html$/.test(path)) {
      throw new Error(`Invalid source-relative HTML include: ${path}`);
    }
    const filename = realpathSync(`${sourceDirectory}${path}`);
    if (!normalizePath(filename).startsWith(normalizePath(sourceDirectory))) {
      throw new Error(`HTML include escapes src/: ${path}`);
    }
    if (activeIncludes.has(filename)) {
      throw new Error(`Circular HTML include: ${path}`);
    }
    activeIncludes.add(filename);
    try {
      return expandHtmlIncludes(readFileSync(filename, 'utf8').trimEnd(), activeIncludes);
    } finally {
      activeIncludes.delete(filename);
    }
  });
}

/** Keep development and production preview aligned with CloudFront's public routes. */
function configureRoutes(server: { middlewares: Connect.Server }) {
  server.middlewares.use((request, _response, next) => {
    const path = request.url?.split('?')[0];
    const target = path === '/' ? '/home/index.html'
      : path === '/resume' ? '/resume/index.html' : undefined;
    if (target && request.url) {
      request.url = target + request.url.slice(path!.length);
    }
    next();
  });
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  appType: 'mpa',
  plugins: [{
    name: 'html-components',
    configureServer(server) {
      configureRoutes(server);
      server.watcher.add(homeMetadata);
    },
    configurePreviewServer: configureRoutes,
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const expanded = expandHtmlIncludes(html);
        return normalizePath(context.filename) === normalizePath(homeEntry)
          ? expanded.replace('</head>', `${renderHomeMetadata()}\n  </head>`)
          : expanded;
      },
    },
    handleHotUpdate({ file, server }) {
      if (file === normalizePath(homeMetadata)
        || (file.startsWith(normalizePath(sourceDirectory)) && file.endsWith('.html'))) {
        server.ws.send({ type: 'full-reload', path: '*' });
        return [];
      }
    },
  }],
  build: {
    rolldownOptions: {
      input: {
        home: homeEntry,
      },
    },
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
