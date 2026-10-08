/* Beaztcode service worker.
   - Precache the app shell (versioned cache, old caches purged on activate).
   - Navigations: network-first with cached fallback, so the site works offline.
   - Static assets: stale-while-revalidate.
   - Update flow: the page shows a toast and sends SKIP_WAITING. */
const VERSION = "v1.3.2";
const CACHE = "beaztcode-" + VERSION;
const SHELL = [
  "./", "index.html", "style.css", "main.js", "i18n.js", "theme.js", "manifest.webmanifest",
  "assets/avatar.svg", "assets/clients/weit.png", "assets/clients/edf.svg", "assets/clients/michelin-wordmark.svg", "assets/clients/atos.svg", "assets/clients/keolis.svg", "assets/clients/pad.png", "assets/clients/quitus.png", "assets/certs/gcp-devops.png", "assets/certs/gcp-appdev.png", "assets/logos/amazonwebservices.svg", "assets/logos/android.svg", "assets/logos/angular.svg", "assets/logos/apachekafka.svg", "assets/logos/claude.svg", "assets/logos/cypress.svg", "assets/logos/docker.svg", "assets/logos/elasticsearch.svg", "assets/logos/git.svg", "assets/logos/github.svg", "assets/logos/githubcopilot.svg", "assets/logos/gitlab.svg", "assets/logos/googlecloud.svg", "assets/logos/googlegemini.svg", "assets/logos/grafana.svg", "assets/logos/helm.svg", "assets/logos/intellijidea.svg", "assets/logos/jest.svg", "assets/logos/jira.svg", "assets/logos/junit5.svg", "assets/logos/kotlin.svg", "assets/logos/kubernetes.svg", "assets/logos/linkedin.svg", "assets/logos/liquibase.svg", "assets/logos/microsoftazure.svg", "assets/logos/mongodb.svg", "assets/logos/mysql.svg", "assets/logos/nodedotjs.svg", "assets/logos/openjdk.svg", "assets/logos/opentelemetry.svg", "assets/logos/postgresql.svg", "assets/logos/postman.svg", "assets/logos/rabbitmq.svg", "assets/logos/react.svg", "assets/logos/springboot.svg", "assets/logos/swagger.svg", "assets/logos/terraform.svg", "assets/logos/typescript.svg",
  "assets/favicon.svg", "assets/fonts/spacegrotesk.woff2", "assets/fonts/jbmono.woff2",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/maskable-512.png", "assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("beaztcode-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
