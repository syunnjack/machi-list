const fs = require("node:fs");
const path = require("node:path");

function loadEnv(file = ".env") {
  const envPath = path.resolve(__dirname, "..", file);
  if (!fs.existsSync(envPath)) return false;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    const rawValue = trimmed.slice(equalIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = unquote(rawValue);
  }
  return true;
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

module.exports = { loadEnv };
