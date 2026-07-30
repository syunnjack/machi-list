function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function siteAnalyticsHead() {
  const parts = ['    <meta name="robots" content="index, follow">'];

  const verification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  if (verification) {
    parts.push(`    <meta name="google-site-verification" content="${escapeHtml(verification)}">`);
  }

  const measurementId = process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID?.trim();
  if (measurementId) {
    const id = escapeHtml(measurementId);
    parts.push(`    <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`);
    parts.push(`    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');</script>`);
  }

  return parts.join("\n");
}

module.exports = { siteAnalyticsHead };
