---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

---

## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Run command '...'
3. See error '...'

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

What actually happened, including error messages or unexpected behavior.

## Environment

**Operating System:**
- [ ] macOS
- [ ] Windows
- [ ] Linux (specify distribution)
- [ ] Other (please specify)

**Node.js Version:**
```bash
node --version
```

**npm Version:**
```bash
npm --version
```

**Claude Desktop Version:**
- Version: [e.g., 2.0.0]
- Installation method: [e.g., Download from website, Homebrew]

**remotolist-mcp Version:**
```bash
npx remotolist-mcp --version
# or if installed globally
remotolist-mcp --version
```

## Configuration

**Configuration file location:** `~/.remotolist/config.json`

**Configuration content (remove API key):**
```json
{
  "apiKey": "cj_mcp_...",
  "sseUrl": "https://remotolist.com/mcp/sse/",
  "version": "1.0.0",
  "installationId": "...",
  "createdAt": "...",
  "lastUpdated": "...",
  "telemetryOptIn": true
}
```

## Error Output

**Full error message:**
```
Paste the complete error output here
```

**Command that caused the error:**
```bash
Paste the exact command here
```

## Screenshots

If applicable, add screenshots to help explain your problem.

## Additional Context

Add any other context about the problem here.

- [ ] I have checked existing issues and this is not a duplicate
- [ ] I have included all relevant information
- [ ] I have removed my API key from the configuration example