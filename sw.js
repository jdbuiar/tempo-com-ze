/* Tempo com Zé: works offline, but always shows the newest version when there is internet.
   Page: network first (falls back to the saved copy if the network is slow or offline).
   Versioned files (?v=) never change, so they are served straight from the cache.
   Images and sounds: answer from the cache at once and refresh it in the background. */
const CACHE='tempo-com-ze-v24';
const PAGE_TIMEOUT=3500;
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function put(req,res){if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});}return res;}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==location.origin||req.destination==='audio'||req.destination==='video'||req.headers.has('range'))return;
  // Page: try the network first, so a new version shows up on the first visit.
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      const saved=caches.match(new Request(url.origin+'/'));
      const net=fetch(req).then(res=>put(new Request(url.origin+'/'),res));
      const slow=new Promise(r=>setTimeout(()=>r(null),PAGE_TIMEOUT));
      try{const first=await Promise.race([net,slow]);if(first&&first.ok)return first;}catch{}
      const hit=await saved;if(hit){e.waitUntil(net.catch(()=>{}));return hit;}
      return net;
    })());
    return;
  }
  // Versioned scripts and styles: cache first.
  if(url.searchParams.has('v')&&/\.(js|css)$/.test(url.pathname)){e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>put(req,res))));return;}
  // Images, manifest: cache at once, refresh in the background.
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(res=>put(req,res)).catch(()=>hit);
    if(hit){e.waitUntil(net);return hit;}
    return net;
  }));
});
