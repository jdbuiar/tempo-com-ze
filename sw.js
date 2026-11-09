/* Tempo com Zé: opens instantly from the phone's copy, then refreshes in the background.
   Versioned files (?v=) never change, so they are served straight from the cache. */
const CACHE='tempo-com-ze-v23';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function put(req,res){if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});}return res;}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==location.origin||req.destination==='audio'||req.destination==='video'||req.headers.has('range'))return;
  // Versioned scripts and styles: cache first.
  if(url.searchParams.has('v')&&/\.(js|css)$/.test(url.pathname)){e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>put(req,res))));return;}
  // Page, images, sounds, manifest: answer from the cache at once and refresh it in the background.
  e.respondWith(caches.match(req,{ignoreSearch:req.mode==='navigate'}).then(hit=>{
    const net=fetch(req).then(res=>put(req.mode==='navigate'?new Request(url.origin+'/'):req,res)).catch(()=>hit);
    if(hit){e.waitUntil(net);return hit;}
    return net.then(r=>r||caches.match('/'));
  }));
});
