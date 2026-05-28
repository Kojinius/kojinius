// 2026-05-28 claude-sonnet-4-6 セッションターン数：- Typolish 譲渡先(SKYDIRECTION様)向け技術引き継ぎ書。kojinius.jp/typolish/ 配下・シンプルログイン(post-pilot流用)。DNS=Cloudflare/Craftica退避済/Cron5本の実態反映・トーン丁寧化
// 仕様: sessionStorage 認証フラグが無ければ /typolish/login.html へリダイレクト。元の URL を returnTo クエリで保持。
// post-pilot/proposals/auth.js から流用・typolish 用に変更（キー名・リダイレクト先・pathname チェック）
(function () {
  if (location.pathname.endsWith("/typolish/login.html")) return;
  if (sessionStorage.getItem("typolish-authed") === "1") return;
  const returnTo = encodeURIComponent(location.pathname + location.search + location.hash);
  location.replace("/typolish/login.html?returnTo=" + returnTo);
})();
