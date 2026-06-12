// 수능 단어장 서비스워커 — 완전 오프라인 캐싱
// 데이터/코드를 바꾸면 아래 CACHE 버전을 올려야 새 버전이 반영됨
const CACHE = 'vocab-v4';

const ASSETS = [
  '.',
  'index.html',
  'vocab_data.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

// 설치: 핵심 파일을 미리 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 활성화: 옛 캐시 정리
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청: 캐시 우선, 없으면 네트워크(받아오면 캐시에 저장)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
