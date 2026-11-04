// Guards against publishing sensitive data: credentials, keys, personal emails, or server secrets in the browser bundle.
// Scans every file git would publish: tracked files plus new files that are not git-ignored.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

const publishable = git('ls-files', '--cached', '--others', '--exclude-standard')
  .split('\n')
  .filter((f) => f && existsSync(join(root, f)));

/** Text contents of publishable files (binary files are skipped). */
const textFiles = publishable.flatMap((path) => {
  const content = readFileSync(join(root, path), 'utf8');
  return content.includes('\0') ? [] : [{ path, content }];
});

const isIgnored = (path: string) => {
  try {
    git('check-ignore', '-q', path);
    return true;
  } catch {
    return false;
  }
};

const SECRET_PATTERNS: [name: string, pattern: RegExp][] = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['Anthropic/OpenAI-style API key', /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['database URL with a password', /\b(?:mysql|postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^:\s/]+:[^@\s]+@/],
  [
    'hard-coded password/secret',
    /(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)["']?\s*[:=]\s*["'][^"'\s]{6,}["']/i,
  ],
];

const SENSITIVE_FILE = [
  /(^|\/)\.env(\.(?!example$)[^/]+)?$/, // .env, .env.local, .env.production … (but not .env.example)
  /\.(pem|key|p12|pfx|jks|keystore)$/i,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/,
  /\.(sqlite3?|db)$/i, // database files with real data
];

/** Emails are allowed only on reserved example domains (RFC 2606) or GitHub's noreply. */
const ALLOWED_EMAIL = /@(example\.(com|org|net)|[a-z0-9-]+\.example|users\.noreply\.github\.com)$/i;

test('no credentials, tokens or keys in any publishable file', () => {
  const hits = textFiles.flatMap(({ path, content }) =>
    SECRET_PATTERNS.filter(([, re]) => re.test(content)).map(([name]) => `${path}: ${name}`)
  );
  assert.deepEqual(hits, []);
});

test('no env files, private keys or database files are published', () => {
  assert.deepEqual(
    publishable.filter((f) => SENSITIVE_FILE.some((re) => re.test(f))),
    []
  );
});

test('.env files are git-ignored everywhere, .env.example is not', () => {
  for (const path of ['.env', '.env.local', '.env.production', 'backend/.env', 'database/.env']) {
    assert.ok(isIgnored(path), `${path} must be git-ignored`);
  }
  assert.ok(!isIgnored('.env.example'), '.env.example must stay committable');
});

test('.env.example (if present) leaves every secret value empty', () => {
  const path = join(root, '.env.example');
  if (!existsSync(path)) return;
  const filled = readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => /^\s*[A-Z0-9_]*(PASSWORD|SECRET|TOKEN|KEY)[A-Z0-9_]*\s*=\s*\S/.test(line));
  assert.deepEqual(filled, []);
});

test('no personal email addresses (use example.com in mock data)', () => {
  const hits = textFiles.flatMap(({ path, content }) =>
    (content.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [])
      .filter((email) => !ALLOWED_EMAIL.test(email))
      .map((email) => `${path}: ${email}`)
  );
  assert.deepEqual(hits, []);
});

test('browser code cannot reach server secrets', () => {
  // Vite ships every VITE_* variable to the browser, so none may carry a secret.
  const exposed = textFiles.filter(({ content }) => /\bVITE_[A-Z0-9_]*(PASSWORD|SECRET|TOKEN|KEY)/.test(content));
  assert.deepEqual(exposed.map((f) => f.path), []);

  // frontend/ is the browser bundle: no DB driver, no server env, no imports from backend/ or database/.
  const leaks = textFiles
    .filter(({ path }) => path.startsWith('frontend/'))
    .filter(({ content }) => /process\.env|\bDB_[A-Z]+\b|['"]mysql2|from ['"][./]*(backend|database)\//.test(content))
    .map((f) => f.path);
  assert.deepEqual(leaks, []);
});
