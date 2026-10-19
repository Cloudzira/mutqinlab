const C='mutqinlab-v6',SHELL=['./','index.html','manifest.webmanifest','icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request,h=new URL(r.url).hostname;
 if(r.method!='GET'||r.headers.has('range')||/firestore|identitytoolkit|securetoken|accounts\.google|firebaseapp/.test(h))return;
 e.respondWith(fetch(r.mode=='navigate'?r.url:r,/\.(html|js|webmanifest)$/.test(new URL(r.url).pathname)||r.mode=='navigate'?{cache:'reload'}:undefined).then(res=>{if(res.ok||res.type=='opaque'){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
