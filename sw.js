// Mandado: copia guardada en el teléfono para que abra SIEMPRE, con o sin internet.
// Estrategia: abre al instante con lo guardado y, si hay internet, actualiza en segundo plano.
const CACHE = 'mandado-v5';
const FONTS = 'mandado-fuentes';
const HOME = './';
const FILES = [
  './', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest',
  'img/hero.svg', 'img/hero-neon.svg',
  'icons/icon-neon-192.png', 'icons/icon-neon-512.png', 'icons/icon-neon-maskable-512.png',
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap';

// Guarda los archivos uno por uno: si alguno falla (mala señal), los demás sí se guardan.
async function saveAll() {
  const cache = await caches.open(CACHE);
  await Promise.all(FILES.map((f) => cache.add(new Request(f, { cache: 'reload' })).catch(() => {})));
  const fonts = await caches.open(FONTS);
  await fonts.add(FONT_CSS).catch(() => {});
}

self.addEventListener('install', (e) => {
  e.waitUntil(saveAll().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Antes de borrar copias viejas, confirma que la nueva tiene la pantalla principal.
    const cache = await caches.open(CACHE);
    const ok = (await cache.match(HOME)) || (await cache.match('index.html'));
    if (ok) {
      for (const k of await caches.keys()) if (k !== CACHE && k !== FONTS) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

// Busca en todas las copias guardadas (la nueva y, si hiciera falta, una anterior).
const fromCache = (req) => caches.match(req, { ignoreSearch: true });

// Pide a internet y, si responde bien, guarda la copia nueva.
function refresh(req, cacheName = CACHE) {
  return fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) {
      const copy = res.clone();
      caches.open(cacheName).then((c) => c.put(req, copy));
    }
    return res;
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 1) Abrir la app: primero lo guardado (instantáneo); si no está, internet; y si tampoco, la pantalla principal.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cached = (await fromCache(req)) || (await fromCache(HOME)) || (await fromCache('index.html'));
      const network = refresh(req).catch(() => null);
      if (cached) { e.waitUntil(network); return cached; }
      const res = await network;
      return res || new Response('<h1>Mandado</h1><p>Abre la app una vez con internet para guardarla en tu teléfono.</p>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    })());
    return;
  }

  // 2) Letras (Google Fonts): se guardan la primera vez y después se usan sin internet.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const cached = await fromCache(req);
      if (cached) return cached;
      try { return await refresh(req, FONTS); }
      catch (err) {
        // Sin internet y sin copia: la app usa su letra de respaldo, sin errores.
        const isCss = url.hostname === 'fonts.googleapis.com';
        return new Response('', { status: isCss ? 200 : 504, headers: isCss ? { 'Content-Type': 'text/css' } : {} });
      }
    })());
    return;
  }

  // 3) Archivos de la app (estilos, código, imágenes): lo guardado al instante y se actualiza en segundo plano.
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cached = await fromCache(req);
      const network = refresh(req).catch(() => null);
      if (cached) { e.waitUntil(network); return cached; }
      return (await network) || Response.error();
    })());
  }
});
