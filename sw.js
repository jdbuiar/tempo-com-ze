/* Tempo com Zé: keeps the page usable offline; always tries the network first so updates appear right away. */
const CACHE='tempo-com-ze-v1';
const SHELL=['./','index.html','style.css','surf.css','i18n.js','city-search.js','app.js','navigation.js','walk-motion.js','character-weather.js','ze-voice.js','character.js','surf.js','surf-ze.js','ze-touch.js','install.js','assets/ze-face-logo.webp','assets/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
