const { spawnSync } = require("node:child_process");

const scripts = [
  "seeds:places",
  "candidates:review",
  "candidates:adopt",
  "generate",
  "report:data",
  "report:adoption",
  "report:mvp"
];

for (const scriptName of scripts) {
  const { command, args, label } = npmStep(scriptName);
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    console.error(`Pipeline stopped at: ${label}`);
    process.exit(result.status || 1);
  }
}

console.log("\nData pipeline finished.");

function npmStep(scriptName) {
  const label = `npm run ${scriptName}`;
  if (process.platform === "win32") {
    return {
      command: process.env.ComSpec || "cmd.exe",
      args: ["/d", "/s", "/c", label],
      label
    };
  }
  return {
    command: "npm",
    args: ["run", scriptName],
    label
  };
}
