#!/usr/bin/env bash
# Classic Cosmetics quick security audit.
# Run from the repository root AFTER `npm run build`.
# Usage: BASE_URL=https://your-site.example bash scripts/security-audit.sh
# Default BASE_URL is http://localhost:3000 (run `npm start` first).
set -u

BASE="${BASE_URL:-http://localhost:3000}"
FAILS=0
WARNS=0

pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1"; FAILS=$((FAILS + 1)); }
warn() { echo "WARN  $1"; WARNS=$((WARNS + 1)); }

# expect_empty "label" "output": passes when output is empty
expect_empty() {
  if [ -z "$2" ]; then
    pass "$1"
  else
    fail "$1"
    echo "$2" | head -5 | sed 's/^/        /'
  fi
}

# g "regex": search the source folders
g() {
  git grep -nE "$1" -- app components lib scripts middleware.ts 'next.config.*' 2>/dev/null \
    | grep -v 'scripts/security-audit.sh'
}

echo "== Source checks =="

expect_empty "2   no dangerouslySetInnerHTML" "$(g 'dangerouslySetInnerHTML')"
expect_empty "12  no localStorage / sessionStorage / indexedDB" "$(g 'localStorage|sessionStorage|indexedDB')"
expect_empty "1   no raw SQL, eval or Function constructor" "$(g 'eval\(|new Function|\\.query\\(|\\$queryRaw|sql`')"
expect_empty "1   no template strings inside .or() / .filter()" "$(g '\\.(or|filter)\\(\\s*`')"

OR_USE="$(g '\.(or|filter)\(')"
if [ -n "$OR_USE" ]; then
  warn "1   .or() / .filter() used: confirm no user input goes into these strings"
  echo "$OR_USE" | head -5 | sed 's/^/        /'
else
  pass "1   no .or() / .filter() calls"
fi

expect_empty "7   no JWT secret or service role usage" "$(g 'service_role|SERVICE_ROLE|JWT_SECRET|jsonwebtoken')"
if [ -f package.json ]; then
  expect_empty "7   no JWT library in package.json" "$(grep -E '\"(jsonwebtoken|jose)\"' package.json)"
fi
expect_empty "9   no password hashing or password columns in app code" "$(g 'bcrypt|createHash\(.(md5|sha1)')"
expect_empty "11  no CORS code" "$(g 'Access-Control-Allow|from .cors.|require\(.cors.\)')"
expect_empty "17  source maps not enabled in config" "$(g 'productionBrowserSourceMaps\s*:\s*true')"
expect_empty "8   no Supabase browser client or public Supabase variables" "$(g 'createBrowserClient|NEXT_PUBLIC_SUPABASE')"
expect_empty "19  no console.log / console.debug" "$(g 'console\.(log|debug)')"

BAD_PUBLIC="$(git grep -hoE 'NEXT_PUBLIC_[A-Z0-9_]+' -- app components lib middleware.ts 'next.config.*' .env.example 2>/dev/null | sort -u | grep -v '^NEXT_PUBLIC_TURNSTILE_SITE_KEY$')"
expect_empty "8   only NEXT_PUBLIC_TURNSTILE_SITE_KEY is public" "$BAD_PUBLIC"

expect_empty "8   no env files committed (except .env.example)" "$(git ls-files | grep -E '(^|/\)\.env' | grep -v '\.env\.example$')"

if ls lib/supabase/*.ts >/dev/null 2>&1; then
  expect_empty "8   every lib/supabase file imports server-only" "$(grep -L "server-only" lib/supabase/*.ts)"
else
  warn "8   lib/supabase/ not found (skipped server-only check)"
fi

expect_empty "18  no default or demo credentials in repo" "$(git grep -nIiE 'password123|changeme|admin@example|test@test' -- . ':!scripts/security-audit.sh' ':!*.md' 2>/dev/null)"

if [ -d .next/static ]; then
  expect_empty "17  no .map files in build output" "$(find .next/static -name '*.map' 2>/dev/null)"
  expect_empty "8   no keys or secret names in browser bundle" "$(grep -RIlE 'eyJ[A-Za-z0-9_-]{20,}|SUPABASE_ANON_KEY|TURNSTILE_SECRET_KEY' .next/static 2>/dev/null)"
else
  warn "17  .next/static not found: run npm run build first"
fi

if command -v gitleaks >/dev/null 2>&1; then
  if gitleaks detect --no-banner >/dev/null 2>&1; then pass "8   gitleaks found no secrets"; else fail "8   gitleaks found possible secrets"; fi
else
  warn "8   gitleaks not installed (skipped)"
fi

if command -v npm >/dev/null 2>&1; then
  if npm audit --omit=dev --audit-level=high >/dev/null 2>&1; then pass "20  npm audit: no high or critical issues"; else fail "20  npm audit reports high or critical issues"; fi
fi

echo
echo "== Live checks against $BASE =="

HDR="$(curl -sSI --max-time 15 "$BASE/" 2>/dev/null || true)"
if [ -z "$HDR" ]; then
  fail "site not reachable at $BASE"
else
  has() { echo "$HDR" | grep -qi "^$1:"; }
  has 'content-security-policy' && pass "2   Content-Security-Policy header present" || fail "2   Content-Security-Policy header missing"
  has 'strict-transport-security' && pass "    HSTS header present" || warn "    HSTS header missing (expected on https only)"
  has 'x-content-type-options' && pass "    X-Content-Type-Options present" || fail "    X-Content-Type-Options missing"
  has 'referrer-policy' && pass "    Referrer-Policy present" || fail "    Referrer-Policy missing"
  if has 'x-frame-options' || echo "$HDR" | grep -qi 'frame-ancestors'; then pass "    clickjacking protection present"; else fail "    clickjacking protection missing"; fi
  has 'x-powered-by' && fail "    X-Powered-By header is exposed" || pass "    X-Powered-By hidden"

  CORS="$(curl -sSI --max-time 15 -H 'Origin: https://evil.example' "$BASE/api/products" 2>/dev/null | grep -i '^access-control-allow-origin:' || true)"
  expect_empty "11  no CORS header for a foreign origin" "$CORS"

  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$BASE/admin")"
  case "$CODE" in 301|302|303|307|308|401|403) pass "13  /admin without a session does not open ($CODE)";; *) fail "13  /admin without a session returned $CODE";; esac

  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -X POST "$BASE/api/admin/upload")"
  case "$CODE" in 401|403) pass "4   upload without login is refused ($CODE)";; *) fail "4   upload without login returned $CODE";; esac

  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -X POST -H 'Origin: https://evil.example' "$BASE/api/admin/upload")"
  case "$CODE" in 401|403) pass "3   upload from a foreign origin is refused ($CODE)";; *) fail "3   upload from a foreign origin returned $CODE";; esac

  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$BASE/_next/image?url=https%3A%2F%2Fexample.com%2Fa.png&w=640&q=75")"
  case "$CODE" in 400|403|404) pass "16  image optimizer refuses foreign hosts ($CODE)";; *) fail "16  image optimizer returned $CODE for a foreign host";; esac

  JS="$(curl -s --max-time 15 "$BASE/" | grep -oE '/_next/static/[^"]+\.js' | head -1)"
  if [ -n "$JS" ]; then
    CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$BASE$JS.map")"
    [ "$CODE" = "404" ] && pass "17  source map is not served" || fail "17  source map request returned $CODE"
  else
    warn "17  could not find a script URL to test source maps"
  fi

  for P in "'" "' OR 1=1 --" "%" "_" "),is_visible.eq.false"; do
    CODE="$(curl -G -s -o /dev/null -w '%{http_code}' --max-time 15 "$BASE/api/products" --data-urlencode "q=$P")"
    if [ "$CODE" -lt 500 ] 2>/dev/null; then pass "1   search probe handled safely ($CODE): $P"; else fail "1   search probe caused $CODE: $P"; fi
  done

  XSS='<script>alert(1)</script>'
  BODY="$(curl -s -G --max-time 15 "$BASE/" --data-urlencode "q=$XSS")"
  echo "$BODY" | grep -qF "$XSS" && fail "2   search text is reflected unescaped" || pass "2   search text is not reflected as raw HTML"

  HITS=0
  for _ in $(seq 1 70); do
    C="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$BASE/api/products?q=test")"
    [ "$C" = "429" ] && HITS=$((HITS + 1))
  done
  [ "$HITS" -gt 0 ] && pass "6   rate limit returned 429 on /api/products" || warn "6   no 429 after 70 quick requests: rate limiting may be missing"
fi

echo
echo "Not covered by this script (test by hand): login limits and Turnstile, admin-only actions with a real"
echo "non-admin session, file upload edge cases, RLS smoke test, log contents, multi-factor (accepted risk)."
echo
echo "Result: $FAILS failed, $WARNS warnings."
[ "$FAILS" -eq 0 ]
