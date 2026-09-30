const CACHE='color-lab-v2270-reference-board';
const ASSETS=['./','./index.html','./manifest.json','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./vendor/poline.umd.js','./vendor/iro.min.js','./vendor/Sortable.min.js','./data/fashion-palettes.js','./data/ig-style-patterns.js','./data/inspiration-atlas.js','./data/tone-families.js','./runtime/palette-tools.js','./runtime/tone-explorer.js','./runtime/context-preview.css','./runtime/photo-palette.js','./runtime/photo-palette.css','./runtime/color-relationship.js','./runtime/color-relationship.css','./runtime/role-scale.js','./runtime/role-scale.css','./runtime/share-snapshot.js','./runtime/share-snapshot.css','./runtime/custom-design-preview.js','./runtime/custom-design-preview.css','./runtime/vision-accessibility.js','./runtime/vision-accessibility.css','./runtime/local-projects.js','./runtime/local-projects.css','./runtime/reference-board.js','./vendor/qrcode.min.js'];

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

  const url=new URL(request.url);
  const sameOrigin=url.origin===self.location.origin;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{});
          }
          return response;
        })
        .catch(async()=>(await caches.match('./index.html'))||(await caches.match('./')))
    );
    return;
  }

  if(sameOrigin){
    event.respondWith(
      caches.match(request).then(cached=>{
        if(cached)return cached;
        return fetch(request).then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(fetch(request).catch(()=>caches.match(request)));
});
