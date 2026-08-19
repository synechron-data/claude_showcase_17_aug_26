#!/usr/bin/env node
/**
 * PreToolUse hook: blocks dangerous Bash commands before Claude runs them.
 * Exit 0 = allow, exit 2 = block (Claude sees the printed reason).
 */

const fs   = require('fs');
const path = require('path');

const LOG_FILE = path.join('.claude', 'hook-logs', 'bash-guard.log');

function appendLog(msg) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, msg + '\n', 'utf8');
}

// Regex patterns matching known-dangerous shell commands. Any Bash tool_input
// whose command matches one of these should be hard-blocked by the hook —
// these are destructive or irreversible operations with no legitimate reason
// to run inside an automated/agentic workflow.
const DANGER_PATTERNS = [
    /rm\s+-rf\s+\//,                          // recursive force-delete from root (e.g. "rm -rf /")
    /sudo\s+rm/,                              // any sudo-elevated delete — bypasses normal permission checks
    /:\(\)\{\s*:\|:&\s*\}\s*;\s*:/,           // fork bomb — ":(){ :|:& };:" spawns processes until the system locks up
    /dd\s+if=.*of=\/dev\/sd/,                 // raw disk write via dd — can overwrite an entire drive
    /chmod\s+777\s+\//,                       // world-writable permissions on root — opens up the whole filesystem
];

let raw = '';
process.stdin.on('data', chunk => (raw += chunk));
process.stdin.on('end', () => {
    let cmd;
    try {
        cmd = JSON.parse(raw).tool_input?.command ?? '';
    } catch {
        process.exit(0);
    }

    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });

    for (const pattern of DANGER_PATTERNS) {
        if (pattern.test(cmd)) {
            const reason = `BLOCKED — matches danger pattern: ${pattern}`;
            appendLog(`[${timestamp}] ${reason}`);
            appendLog(`  cmd=${cmd}`);
            appendLog('');
            console.error(reason);
            process.exit(2);
        }
    }

    appendLog(`[${timestamp}] ALLOWED cmd=${cmd}`);
    process.exit(0);
});
