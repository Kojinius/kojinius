// 2026-05-26 21:00:00 claude-opus-4-7 セッションターン数：38 — post-pilot 提案資料ゲート（クライアントサイド簡易認証）
// 仕様: sessionStorage 認証フラグが無ければ /post-pilot/proposals/login.html へリダイレクト。元の URL を returnTo クエリで保持。
(function () {
  if (location.pathname.endsWith("/post-pilot/proposals/login.html")) return;
  if (sessionStorage.getItem("post-pilot-authed") === "1") return;
  const returnTo = encodeURIComponent(location.pathname + location.search + location.hash);
  location.replace("/post-pilot/proposals/login.html?returnTo=" + returnTo);
})();
