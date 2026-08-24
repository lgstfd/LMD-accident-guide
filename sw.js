/* 사고 현장 대응 가이드 — 오프라인 캐시
   가이드를 수정해 다시 올릴 때는 아래 VERSION 숫자를 올려주세요.
   그래야 사용자 기기에서 새 버전으로 갱신됩니다. */
const VERSION = 'v3';
const CACHE = 'accident-guide-' + VERSION;
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* 네트워크 우선 — 연결되면 최신본, 끊기면 저장본 */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
