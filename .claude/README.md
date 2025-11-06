# Claude Code Configuration

This directory contains Claude Code configuration for this project.

## Settings

### Permissions Skip (YOLO Mode)

The global config at `~/.claude/config.json` is set to:
```json
{
  "dangerouslySkipPermissions": true
}
```

This allows Claude Code to work end-to-end without asking for permission on every action.

### Alternative Usage

You can also run Claude Code with the flag:
```bash
claude --dangerously-skip-permissions
```

## What This Enables

With permissions skipped, Claude Code can:
- Read and write files without asking
- Run commands without confirmation
- Deploy and make changes autonomously
- Work through complex tasks from start to finish

## Safety Note

This setting is great for development but be cautious when:
- Working with production systems
- Making irreversible changes
- Handling sensitive data
- Making git commits to main/master

The setting is already configured globally, so all Claude Code sessions in this project will run with permissions skipped.
