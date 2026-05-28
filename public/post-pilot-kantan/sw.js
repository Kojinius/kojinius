// 2026-05-28 claude-opus-4-7 セッションターン数：9
// Service Worker — リマインダ発火専用（cache 戦略なし、静的アセットはホスティング側 CDN に委譲）
// basePath: /post-pilot-kantan/ — next.config.ts と必ず一致させる

const BASE_PATH = "/post-pilot-kantan";
const TAG = "kantan-daily";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const pendingTimers = new Map();

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "SCHEDULE_REMINDER" && typeof data.fireAt === "number") {
    const delay = data.fireAt - Date.now();
    const key = String(data.fireAt);

    const existing = pendingTimers.get(key);
    if (existing) clearTimeout(existing);

    if (delay <= 0) {
      fireNotification();
      return;
    }
    if (delay > 24 * 60 * 60 * 1000) {
      // 24h を超える先は信頼性が低い。クライアントが再訪問時に scheduleNext してくる前提。
      return;
    }
    const id = setTimeout(() => {
      pendingTimers.delete(key);
      fireNotification();
    }, delay);
    pendingTimers.set(key, id);
  }
});

async function fireNotification() {
  try {
    await self.registration.showNotification("今日の3案が届いてます", {
      body: "☕ 1分で投稿、はじめませんか？",
      icon: `${BASE_PATH}/icon.svg`,
      tag: TAG,
      data: { url: `${BASE_PATH}/` },
      renotify: true,
      requireInteraction: false,
    });
  } catch (e) {
    /* noop */
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || `${BASE_PATH}/`;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if (c.url.includes(url) && "focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })()
  );
});
