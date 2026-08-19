#!/usr/bin/env node
/**
 * Slack notification helper for Claude Code hooks.
 *
 * Usage (as a module):
 *   const { sendSlackNotification } = require('./slack-notify');
 *   await sendSlackNotification('Task completed!');
 *
 * Usage (standalone CLI):
 *   echo '{"message":"hello"}' | node slack-notify.js
 *
 * Requires env var: SLACK_WEBHOOK_URL
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const logFile = path.join('.claude', 'hook-logs',  'notify-log.log');
fs.mkdirSync(path.dirname(logFile), { recursive: true });

/**
 * Appends a timestamped entry to notify-log.log.
 * @param {string} message - The notification message.
 * @param {'sent'|'failed'} status
 * @param {string} [error] - Error detail on failure.
 */
function writeLog(message, status, error) {
  const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
  const lines = [
    `[${timestamp}] status=${status}`,
    `  message : ${message}`,
  ];
  if (error) lines.push(`  error   : ${error}`);
  try {
    fs.appendFileSync(logFile, lines.join('\n') + '\n\n', 'utf8');
  } catch { /* log write failure is non-fatal */ }
}

/**
 * Posts a message to the configured Slack Incoming Webhook.
 * @param {string} message - Plain text message to send.
 * @returns {Promise<void>}
 */
function sendSlackNotification(message) {
  return new Promise((resolve, reject) => {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      const err = new Error('SLACK_WEBHOOK_URL env var is not set');
      writeLog(message, 'failed', err.message);
      return reject(err);
    }

    const body = JSON.stringify({
      text: `🤖 *Claude Code* — ${message}`,
      username: 'Claude Code',
      icon_emoji: ':robot_face:'
    });

    const url = new URL(webhookUrl);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            writeLog(message, 'sent');
            resolve();
          } else {
            const err = new Error(`Slack returned HTTP ${res.statusCode}: ${data}`);
            writeLog(message, 'failed', err.message);
            reject(err);
          }
        });
      }
    );

    req.on('error', (err) => { writeLog(message, 'failed', err.message); reject(err); });
    req.write(body);
    req.end();
  });
}

module.exports = { sendSlackNotification };

// ── Standalone mode: run directly via stdin payload ───────────────────────────
if (require.main === module) {
  let input = '';
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', async () => {
    let message = 'Claude Code needs your attention';
    let notificationType = '';
    try {
      const payload = JSON.parse(input);
      if (payload.message) message = payload.message;
      if (payload.notification_type) notificationType = payload.notification_type;
    } catch { /* use default */ }

    const fullMessage = notificationType ? `[${notificationType}] ${message}` : message;

    try {
      await sendSlackNotification(fullMessage);
      console.log(`[slack-notify] Sent: "${fullMessage}"`);
    } catch (err) {
      console.error(`[slack-notify] Failed: ${err.message}`);
      process.exit(1);
    }
  });
}
