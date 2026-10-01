import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath, type Connect } from 'vite';

const sourceDirectory = fileURLToPath(new URL('./src/', import.meta.url));

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
    configureServer: configureRoutes,
    configurePreviewServer: configureRoutes,
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--\s*include:\s*(.*?)\s*-->/g, (_, path: string) => {
          if (!/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.html$/.test(path)) {
            throw new Error(`Invalid source-relative HTML include: ${path}`);
          }
          const filename = realpathSync(`${sourceDirectory}${path}`);
          if (!normalizePath(filename).startsWith(normalizePath(sourceDirectory))) {
            throw new Error(`HTML include escapes src/: ${path}`);
          }
          return readFileSync(filename, 'utf8').trimEnd();
        });
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(normalizePath(sourceDirectory)) && file.endsWith('.html')) {
        server.ws.send({ type: 'full-reload', path: '*' });
        return [];
      }
    },
  }],
  build: {
    rolldownOptions: {
      input: {
        home: fileURLToPath(new URL('./src/home/index.html', import.meta.url)),
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
