const CACHE='color-lab-v14-style';
const ASSETS=['./','./index.html','./manifest.json','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./vendor/poline.umd.js','./vendor/iro.min.js','./vendor/Sortable.min.js','./data/fashion-palettes.js','./data/ig-style-patterns.js'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  event.respondWith(
    fetch(request)
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
        }
        return response;
      })
      .catch(async()=>{
        const cached=await caches.match(request);
        if(cached)return cached;
        if(request.mode==='navigate'){
          return (await caches.match('./index.html'))||(await caches.match('./'));
        }
        return Response.error();
      })
  );
});
