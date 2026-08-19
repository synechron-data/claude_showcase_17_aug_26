#!/usr/bin/env node
/**
 * PostToolUse hook: runs ESLint --fix on any JS file Claude writes or edits.
 * Receives tool input as JSON on stdin.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join('.claude', 'hook-logs', 'eslint-hook.log');

function appendLog(msg) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, msg + '\n', 'utf8');
}

let raw = '';
process.stdin.on('data', chunk => (raw += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(raw).tool_input?.file_path;
  } catch {
    process.exit(0);
  }

  if (!filePath || !/\.(js|mjs|cjs)$/.test(filePath)) {
    process.exit(0);
  }

  const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
  const before = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

  // Use a relative path to avoid Windows path-with-spaces quoting issues in shell mode
  const relPath = path.relative(process.cwd(), filePath) || filePath;

  console.log(`\n[hook:eslint-fix] Running ESLint on: ${relPath}`);

  // Prefer the project-local binary; fall back to npx pinned to v8 (matches package.json)
  const localBin = path.join(process.cwd(), 'node_modules', '.bin', 'eslint');
  const useLocal = fs.existsSync(localBin);
  const eslintCmd = useLocal ? `"${localBin}"` : 'npx eslint@8';
  const result = spawnSync(`${eslintCmd} --fix ${relPath}`, [], {
    encoding: 'utf8',
    shell: true,
  });

  if (result.stdout?.trim()) console.log(result.stdout.trim());
  if (result.stderr?.trim()) console.error(result.stderr.trim());

  const after = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const changed = before !== after;
  const status = result.status === 0 ? 'OK' : `exit code ${result.status}`;

  if (result.stderr?.trim()) appendLog(`  stderr=${result.stderr.trim()}`);
  if (result.error) appendLog(`  spawn-error=${result.error.message}`);
  appendLog(`[${timestamp}] file=${path.basename(filePath)} status=${status} fixed=${changed}`);
  if (changed) {
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    const maxLen = Math.max(beforeLines.length, afterLines.length);
    for (let i = 0; i < maxLen; i++) {
      if (beforeLines[i] !== afterLines[i]) {
        if (beforeLines[i] !== undefined) appendLog(`  - ${beforeLines[i]}`);
        if (afterLines[i] !== undefined) appendLog(`  + ${afterLines[i]}`);
      }
    }
  }
  appendLog('');

  console.log(`[hook:eslint-fix] Done — ${status}\n`);
});
