import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { Readable } from 'node:stream';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Origen del sitio y de la API. En despliegues de un solo dominio detrás de un proxy,
// SITE_URL es el dominio público y API_URL apunta al servicio de la API (interno).
const SITE_URL = (process.env['SITE_URL'] || 'http://localhost:4200').replace(/\/$/, '');
const API_URL = (process.env['API_URL'] || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Reenvia las llamadas de la SPA a la API. Esto permite publicar el front y la
 * API como servicios separados sin exponer una segunda URL al visitante, y
 * conserva las cookies httpOnly del panel administrativo.
 */
app.use('/api', async (req, res, next) => {
  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value && !['host', 'connection', 'content-length'].includes(name.toLowerCase())) {
        headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const upstream = await fetch(`${API_URL}${req.originalUrl}`, {
      method: req.method,
      headers,
      body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
      // Node requiere esta opcion al enviar una solicitud con stream.
      duplex: hasBody ? 'half' : undefined,
    } as RequestInit);

    for (const header of ['content-type', 'cache-control', 'location']) {
      const value = upstream.headers.get(header);
      if (value) res.set(header, value);
    }
    const cookies = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
    if (cookies.length) res.setHeader('set-cookie', cookies);

    res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    next(err);
  }
});

/**
 * robots.txt — permite todo el sitio público, bloquea el panel, apunta al sitemap.
 */
app.get('/robots.txt', (_req, res) => {
  res
    .type('text/plain')
    .send(`User-agent: *\nDisallow: /admin\nDisallow: /carrito\nDisallow: /cot/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

/**
 * sitemap.xml — lo genera la API (tiene acceso a la base). Cache corto en memoria.
 */
let sitemapCache: { xml: string; at: number } | null = null;
app.get('/sitemap.xml', async (_req, res, next) => {
  try {
    if (!sitemapCache || Date.now() - sitemapCache.at > 15 * 60 * 1000) {
      const r = await fetch(`${API_URL}/api/sitemap.xml`);
      sitemapCache = { xml: await r.text(), at: Date.now() };
    }
    res.type('application/xml').send(sitemapCache.xml);
  } catch (err) {
    next(err);
  }
});

/**
 * /fotos — fotos decorativas servidas por la API (mientras no todo esté en Cloudinary).
 * En despliegues de un solo dominio, el proxy debería mapear esto directo a la API;
 * este reenvío cubre `ng serve` y despliegues sin proxy dedicado.
 */
app.get(/^\/fotos\/.+/, (req, res, next) => {
  fetch(`${API_URL}${req.originalUrl}`)
    .then(async (upstream) => {
      if (!upstream.ok) {
        res.status(upstream.status).end();
        return;
      }
      res.set('content-type', upstream.headers.get('content-type') ?? 'image/webp');
      res.set('cache-control', 'public, max-age=86400');
      res.send(Buffer.from(await upstream.arrayBuffer()));
    })
    .catch(next);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
