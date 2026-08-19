const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join('.claude', 'hook-logs', 'pretooluse-demo.log');

function logMessage(message) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
}

let raw = '';
process.stdin.on('data', (chunk) => {
    raw += chunk;
});

process.stdin.on('end', () => {
    process.exit(0);

    // -------------------------------- Allow and log input
    // const payload = JSON.parse(raw);
    // const timeStamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
    // logMessage("\n" + "-".repeat(60));
    // logMessage(`[${timeStamp}] tool=${payload.tool_name}`);
    // logMessage('STDIN PAYLOAD:');
    // logMessage(JSON.stringify(payload, null, 2));
    // process.exit(0);

    // -------------------------------- Allow and override input
    // const payload = JSON.parse(raw);
    // const timeStamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
    // logMessage("\n" + "-".repeat(60));
    // logMessage(`[${timeStamp}] tool=${payload.tool_name}`);
    // logMessage('STDIN PAYLOAD:');
    // logMessage(JSON.stringify(payload, null, 2));
    // const response = {
    //     hookSpecificOutput: {
    //         hookEventName: 'PreToolUse',
    //         permissionDecision: 'allow',
    //         permissionDecisionReason: '[pretooluse-demo] hook allowed and overrode this tool call.',
    //         updatedInput: { ...payload.tool_input, command: 'echo overridden by custom script' }
    //     }
    // };
    // logMessage(JSON.stringify(response, null, 2));
    // process.stdout.write(JSON.stringify(response));
    // process.exit(0);

    // -------------------------------- Hard block
    // process.exit(2) hard-blocks the tool call; Claude Code treats it as an error
    // and shows stderr output (if any) as the reason — no JSON response needed.
    // const payload = JSON.parse(raw);
    // const timeStamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
    // logMessage("\n" + "-".repeat(60));
    // logMessage(`[${timeStamp}] tool=${payload.tool_name}`);
    // logMessage('STDIN PAYLOAD:');
    // logMessage(JSON.stringify(payload, null, 2));
    // logMessage('BLOCKED: process.exit(2) — see stderr for reason');
    // process.stderr.write('[pretooluse-demo] hook blocked this tool call.\n');
    // process.exit(2);

    // -------------------------------- Hard block with Deny
    // Deny: rejects the tool call via structured JSON on stdout while exiting
    // cleanly (0). permissionDecisionReason is shown to Claude, explaining why
    // the call was denied — unlike exit(2), no stderr text is needed.
    // const payload = JSON.parse(raw);
    // const timeStamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
    // logMessage("\n" + "-".repeat(60));
    // logMessage(`[${timeStamp}] tool=${payload.tool_name}`);
    // logMessage('STDIN PAYLOAD:');
    // logMessage(JSON.stringify(payload, null, 2));

    // const response = {
    //     hookSpecificOutput: {
    //         hookEventName: 'PreToolUse',
    //         permissionDecision: 'deny',
    //         permissionDecisionReason: '[pretooluse-demo] hook blocked this tool call.'
    //     }
    // };
    // logMessage('BLOCK RESPONSE:');
    // logMessage(JSON.stringify(response, null, 2));
    // process.stdout.write(JSON.stringify(response));
    // process.exit(0);
});