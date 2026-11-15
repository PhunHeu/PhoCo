const ROOT=new URL('./',self.location.href),SCOPE=ROOT.pathname;
const CACHE='pho-minh-shell-v5-chibi:'+SCOPE;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','icon.svg','manifest.json'].map(p=>new URL(p,ROOT).href))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 let upgrading=false;
 for(const key of await caches.keys()){
  const scoped=key.startsWith('pho-minh-shell-')&&key.endsWith(':'+SCOPE);
  const oldRoot=SCOPE==='/'&&(key.startsWith('pho-minh-')||key.startsWith('seoul-borahae-'));
  if(key!==CACHE&&(scoped||oldRoot)){upgrading=true;await caches.delete(key);}
 }
 await self.clients.claim();
 if(upgrading)for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){
  const url=new URL(client.url);if(url.origin===ROOT.origin&&(url.pathname===SCOPE||url.pathname===SCOPE+'index.html'))void client.navigate(client.url).catch(()=>{});
 }
})()));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),relative=url.pathname.slice(SCOPE.length);
 if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(SCOPE)||relative.startsWith('api/')||relative.startsWith('legacy/'))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(response.ok&&(event.request.mode==='navigate'||relative.startsWith('assets/')))await cache.put(event.request,response.clone());return response;}catch{return await cache.match(event.request)||(event.request.mode==='navigate'?await cache.match(ROOT.href):undefined)||Response.error();}})());
});
