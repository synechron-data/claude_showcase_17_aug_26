#!/usr/bin/env python3
"""PreToolUse hook demo script for Claude Code.

Reads a JSON payload from stdin (the tool call details Claude Code sends
before executing a tool) and demonstrates four possible hook responses:

1. Allow and log input        - log the call, let it proceed unchanged.
2. Allow and override input   - log the call, but rewrite tool_input
                                 before it runs.
3. Hard block (exit 2)        - legacy-style block via process exit code.
4. Deny (permissionDecision)  - structured block via JSON on stdout.

Only one mode should be active (uncommented) at a time; the rest are kept
as reference examples.
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

LOG_FILE = Path('.claude') / 'hook-logs' / 'pretooluse-demo.log'


def log_message(message):
    """Append a line to the hook's log file.

    Creates the parent log directory if it does not already exist, then
    appends the given message followed by a newline.

    Args:
        message (str): The text to write to the log file.

    Returns:
        None
    """
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(message + '\n')


def main():
    """Read the hook payload from stdin and apply the active demo mode.

    Parses the JSON tool-call payload Claude Code sends on stdin, logs it
    with an IST timestamp, and then either allows, overrides, or denies
    the tool call depending on which block below is uncommented.

    Exit codes:
        0: Tool call is allowed (with or without an overridden input),
           or denied via the structured `permissionDecision: 'deny'`
           response.
        2: Tool call is hard-blocked (legacy style); any stderr text is
           surfaced to Claude as the block reason.

    Returns:
        None
    """
    raw = sys.stdin.read()

    # -------------------------------- Allow and log input
    # payload = json.loads(raw)
    # time_stamp = datetime.now(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d %H:%M:%S')
    # log_message("\n" + "-" * 60)
    # log_message(f"[{time_stamp}] tool={payload.get('tool_name')}")
    # log_message('STDIN PAYLOAD:')
    # log_message(json.dumps(payload, indent=2))
    # sys.exit(0)

    # -------------------------------- Allow and override input
    # payload = json.loads(raw)
    # time_stamp = datetime.now(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d %H:%M:%S')
    # log_message("\n" + "-" * 60)
    # log_message(f"[{time_stamp}] tool={payload.get('tool_name')}")
    # log_message('STDIN PAYLOAD:')
    # log_message(json.dumps(payload, indent=2))
    # response = {
    #     'hookSpecificOutput': {
    #         'hookEventName': 'PreToolUse',
    #         'permissionDecision': 'allow',
    #         'permissionDecisionReason': '[pretooluse-demo] hook allowed and overrode this tool call.',
    #         'updatedInput': {**payload.get('tool_input', {}), 'command': 'echo overridden by custom script'}
    #     }
    # }
    # log_message(json.dumps(response, indent=2))
    # sys.stdout.write(json.dumps(response))
    # sys.exit(0)

    # -------------------------------- Hard block
    # sys.exit(2) hard-blocks the tool call; Claude Code treats it as an error
    # and shows stderr output (if any) as the reason — no JSON response needed.
    # sys.stderr.write('[pretooluse-demo] hook blocked this tool call.\n')
    # sys.exit(2)

    # permissionDecision: 'deny' blocks the tool call while exiting cleanly (0);
    # permissionDecisionReason is shown to Claude so it knows why it was denied.
    # payload = json.loads(raw)
    # time_stamp = datetime.now(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d %H:%M:%S')
    # log_message("\n" + "-" * 60)
    # log_message(f"[{time_stamp}] tool={payload.get('tool_name')}")
    # log_message('STDIN PAYLOAD:')
    # log_message(json.dumps(payload, indent=2))
    #
    # response = {
    #     'hookSpecificOutput': {
    #         'hookEventName': 'PreToolUse',
    #         'permissionDecision': 'deny',
    #         'permissionDecisionReason': '[pretooluse-demo] hook blocked this tool call.'
    #     }
    # }
    # log_message('BLOCK RESPONSE:')
    # log_message(json.dumps(response, indent=2))
    # sys.stdout.write(json.dumps(response))
    # sys.exit(0)


if __name__ == '__main__':
    main()