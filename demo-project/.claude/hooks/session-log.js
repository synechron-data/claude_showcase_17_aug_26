#!/usr/bin/env node
/**
 * Stop hook: appends a per-turn token/cost summary to .claude/session-log.log.
 * Usage data is parsed from the transcript JSONL provided via stdin.
 */

const fs = require('fs');
const path = require('path');

const logFile = path.join('.claude', 'hook-logs', 'session-log.log');
fs.mkdirSync(path.dirname(logFile), { recursive: true });
const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });

/** Sonnet 5 list pricing per token (introductory rate through 2026-08-31 is lower). */
const RATE_PER_TOKEN = {
    input: 3.00 / 1e6,
    output: 15.00 / 1e6,
    cacheWrite5m: 3.75 / 1e6,
    cacheWrite1h: 6.00 / 1e6,
    cacheRead: 0.30 / 1e6,
};

/** Sequential turn number derived from entries already written to the log. */
function getNextTurnNumber() {
    try {
        const content = fs.readFileSync(logFile, 'utf8');
        const matches = content.match(/^\[Turn #\d+\]/gm);
        return matches ? matches.length + 1 : 1;
    } catch {
        return 1;
    }
}

/** Format a token count with thousands separators (en-US). */
function fmt(n) {
    return n.toLocaleString('en-US');
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
    let transcriptPath = null;

    try {
        const payload = JSON.parse(input);
        transcriptPath = payload.transcript_path;
    } catch {
        // running outside Claude Code (e.g. manual test) — no stdin payload
    }

    let newTokens = 0;
    let cacheRead = 0;
    let cacheWrite5m = 0;
    let cacheWrite1h = 0;
    let output = 0;
    let parsed = false;

    if (transcriptPath && fs.existsSync(transcriptPath)) {
        const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(l => l.trim());
        for (const line of lines) {
            try {
                const entry = JSON.parse(line);
                if (entry.type !== 'assistant' || entry.isSidechain) continue;
                const u = entry.message?.usage;
                if (u) {
                    newTokens = u.input_tokens || 0;
                    output = u.output_tokens || 0;
                    cacheRead = u.cache_read_input_tokens || 0;
                    cacheWrite1h = u.cache_creation?.ephemeral_1h_input_tokens || 0;
                    cacheWrite5m = u.cache_creation?.ephemeral_5m_input_tokens
                        || (u.cache_creation_input_tokens || 0) - cacheWrite1h;
                    parsed = true;
                }
            } catch { /* skip malformed lines */ }
        }
    }

    const turnNumber = getNextTurnNumber();
    const promptTotal = newTokens + cacheRead + cacheWrite5m + cacheWrite1h;
    const cacheDetail = (cacheRead + cacheWrite5m + cacheWrite1h) > 0
        ? `(new: ${fmt(newTokens)} | cache read: ${fmt(cacheRead)} | cache write: ${fmt(cacheWrite5m + cacheWrite1h)})`
        : `(all new)`;

    const cost = newTokens * RATE_PER_TOKEN.input
        + output * RATE_PER_TOKEN.output
        + cacheRead * RATE_PER_TOKEN.cacheRead
        + cacheWrite5m * RATE_PER_TOKEN.cacheWrite5m
        + cacheWrite1h * RATE_PER_TOKEN.cacheWrite1h;
    const fmtCost = c => `$${c.toFixed(4)}`;

    const lines = parsed
        ? [
            `  Prompt tokens  : ${fmt(promptTotal).padStart(8)}  ${cacheDetail}`,
            `  Response tokens: ${fmt(output).padStart(8)}`,
            `  Cost (est, Sonnet 5 list rate): ${fmtCost(cost)}`,
        ]
        : ['  Token data not available — transcript not found or empty'];

    const header = `[Turn #${turnNumber}] ${timestamp}`;
    const entry = `${header}\n${lines.join('\n')}\n`;

    console.log(`\n[session-log] Turn #${turnNumber} | cost: ${parsed ? fmtCost(cost) : 'n/a'} | ${timestamp}\n`);

    try {
        fs.appendFileSync(logFile, entry + '\n', 'utf8');
    } catch (err) {
        console.error(`[session-log] Could not write log: ${err.message}`);
    }
});
