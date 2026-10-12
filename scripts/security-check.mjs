// Classic Cosmetics — leak checks and dependency audit (run before delivery).
// Usage: node scripts/security-check.mjs
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
export const projectRoot = dirname(root);

const failed = [];

function run(label, cmd, { silent = false } = {}) {
  try {
    const out = execFileSync(cmd[0], cmd.slice(1), {
      cwd: root,
      encoding: "utf8",
      stdio: silent ? ["pipe", "pipe", "pipe"] : "inherit",
    });
    console.log(`PASS  ${label}`);
    return out;
  } catch (err) {
    const out = err.stdout?.toString().slice(0, 4000) ?? "";
    const code = err.status ?? err.statusCode ?? "nonzero";
    console.error(`FAIL  ${label} (exit ${code})`);
    if (out.trim()) console.error(out.slice(0, 3000));
    failed.push(label);
    return out;
  }
}

console.log("== Repo leak checks ==");
run("no long base64 JWT-like strings in tree", ["git", "grep", "-nIE", "eyJ[A-Za-z0-9_-]{20,}", "--", ".", ":(exclude)*.md"], { silent: true });
run("no service_role / sb_secret / keys in tree", ["git", "grep", "-nIE", "service_role|sb_secret", "--", ".", ":(exclude)*.md"], { silent: true });

console.log("\n== Build bundle leak check ==");
run("npm run build", ["npm", "run", "build"], { silent: true });
const bundle = run("no secrets in .next/static", ["grep", "-RIlE", "eyJ[A-Za-z0-9_-]{20,}|SUPABASE_ANON_KEY|TURNSTILE_SECRET_KEY", ".next/static"], { silent: true });

console.log("\n== Dependency audit ==");
run("npm audit (no high/critical)", ["npm", "audit", "--omit=dev", "--audit-level=high"], { silent: true });

console.log("\nResult:");
if (failed.length === 0) {
  console.log("No secrets or audit issues found.");
  process.exit(0);
} else {
  console.log(`Security check failed: ${failed.join(", ")}`);
  process.exit(1);
}
