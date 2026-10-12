// Classic Cosmetics — leak checks and dependency audit (run before delivery).
// Usage: node scripts/security-check.cjs
const { execFileSync } = require("node:child_process");
const { dirname, join } = require("node:path");
const { fileURLToPath } = require("node:url");

const root = "/c/Users/MSQ/Downloads/Catalog";

const failed = [];

function run(label, cmd, opts = {}) {
  const options = { cwd: root, encoding: "utf8", maxBuffer: 60 * 1024 * 1024 };
  if (opts.silent) options.stdio = ["ignore", "pipe", "pipe"];
  if (opts.shell) options.shell = true;
  try {
    const out = execFileSync(cmd[0], cmd.slice(1), options);
    console.log("PASS  " + label);
    return out;
  } catch (err) {
    const out = (err.stdout || "").toString().slice(0, 4000);
    const code = err.status ?? err.statusCode ?? "nonzero";
    console.error("FAIL  " + label + " (exit " + code + ")");
    if (out.trim()) console.error(out.slice(0, 3000));
    failed.push(label);
    return out;
  }
}

console.log("== Repo leak checks ==");
run("no base64 JWT-like strings in tree", ["git", "grep", "-nF", "-e", "eyJ[A-Za-z0-9_-]{20,}", "--", ".", ":(exclude)*.md", ":(exclude)package-lock.json"], { silent: true });
run("no service_role / sb_secret / keys in tree", ["git", "grep", "-nIE", "-e", "service_role|sb_secret", "--", ".", ":(exclude)*.md", ":(exclude)package-lock.json"], { silent: true });

console.log("");
console.log("== Build bundle leak check ==");
run("npm run build", ["npm", "run", "build"], { silent: true, shell: true });
let bundleMatches = "";
try {
  const out = execFileSync("grep", ["-RIlE", "eyJ[A-Za-z0-9_-]{20,}|SUPABASE_ANON_KEY|TURNSTILE_SECRET_KEY", ".next/static"], { cwd: root, encoding: "utf8", stdio: "pipe", maxBuffer: 1024 * 1024 });
  bundleMatches = out.toString();
} catch (err) { bundleMatches = ""; }
if (bundleMatches) {
  console.error("FAIL  no secrets in .next/static (matches: " + bundleMatches.trim() + ")");
  failed.push("no secrets in .next/static");
} else {
  console.log("PASS  no secrets in .next/static");
}

console.log("");
console.log("== Dependency audit ==");
run("npm audit (no high/critical)", ["npm", "audit", "--omit=dev", "--audit-level=high"], { silent: true, shell: true });

console.log("");
console.log("Result:");
if (failed.length === 0) {
  console.log("No secrets or audit issues found.");
  process.exit(0);
} else {
  console.log("Security check failed: " + failed.join(", "));
  process.exit(1);
}
