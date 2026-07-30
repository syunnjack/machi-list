const fs = require("node:fs");
const path = require("node:path");
const { siteAnalyticsHead } = require("./site-analytics-head");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

html = html.replace(/\n\s*<meta name="robots"[^>]*>\n?/g, "\n");
html = html.replace(/\n\s*<meta name="google-site-verification"[^>]*>\n?/g, "\n");
html = html.replace(/\n\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js[^<]*><\/script>\n?/g, "\n");
html = html.replace(/\n\s*<script>window\.dataLayer[\s\S]*?<\/script>\n?/g, "\n");

const marker = "</head>";
if (!html.includes(marker)) {
  throw new Error("index.html is missing </head>");
}

html = html.replace(marker, `\n${siteAnalyticsHead()}\n  ${marker}`);
fs.writeFileSync(indexPath, html);

console.log("Injected site analytics into index.html");
