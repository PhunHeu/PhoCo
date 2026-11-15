const CACHE = 'pho-minh-shell-v4-chibi';
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/', '/icon.svg', '/manifest.json']).then(()=>self.skipWaiting()))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  let upgrading=false;
  for (const key of await caches.keys()) if ((key.startsWith('pho-minh-') || key.startsWith('seoul-borahae-')) && key !== CACHE) { upgrading=true;await caches.delete(key); }
  await self.clients.claim();
  // The old application had no controllerchange handler. Refresh its root page
  // from the worker itself; retain origin/localStorage and avoid fresh-install loops.
  if(upgrading)for(const client of await self.clients.matchAll({type:'window'})){
    const url=new URL(client.url);if(url.origin===self.location.origin&&(url.pathname==='/'||url.pathname==='/index.html'))await client.navigate(client.url);
  }
})()));
self.addEventListener('message', event => { if (event.data === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api') || url.pathname.startsWith('/legacy')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok && (event.request.mode === 'navigate' || url.pathname.startsWith('/assets/'))) await cache.put(event.request, response.clone());
      return response;
    } catch {
      return await cache.match(event.request) || (event.request.mode === 'navigate' ? await cache.match('/') : undefined) || Response.error();
    }
  })());
});

