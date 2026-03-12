# remotolist-mcp

[![npm version](https://img.shields.io/npm/v/remotolist-mcp.svg)](https://www.npmjs.com/package/remotolist-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

AI-powered semantic search for candidates. Use Claude Desktop to find tech talent with natural language queries.

**⚡ Quick Start (one command):**

```bash
npx remotolist-mcp setup
```

Follow the interactive wizard and you're done!

## Table of Contents

- [What is This?](#what-is-this)
- [Features](#features)
- [Installation & Setup](#installation--setup)
  - [Prerequisites](#prerequisites)
  - [Easy Setup (Recommended)](#easy-setup-recommended)
  - [Manual Setup (Alternative)](#manual-setup-alternative)
- [Usage](#usage)
  - [Available Tools](#available-tools)
- [CLI Commands](#cli-commands)
- [Configuration](#configuration)
  - [Configuration Locations](#configuration-locations)
- [Telemetry](#telemetry)
- [Troubleshooting](#troubleshooting)
- [Development & Local Testing](#development--local-testing)
  - [Using Local Development Server](#using-local-development-server)
  - [Project Structure](#project-structure)
  - [Building from Source](#building-from-source)
- [How It Works](#how-it-works)
- [API Key Security](#api-key-security)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Support](#support)
- [License](#license)
- [Changelog](#changelog)

---

## What is This?

This package connects Claude Desktop to the **RemotoList MCP Server** - an AI-powered candidate search engine built on semantic search and vector embeddings.

**With this, you can ask Claude things like:**

> "Find me senior TypeScript developers with React experience"
> "Show me fullstack developers who speak English and are available immediately"
> "Find candidates with DevOps skills and AWS certification"

Claude will search through the RemotoList database using natural language understanding to find the perfect candidates.

---

## Features

- **🤖 AI-Powered Search**: Natural language queries for candidates
- **⚡ Easy Setup**: Interactive wizard, no environment variables needed
- **🔒 Secure**: API keys stored locally with proper permissions
- **🔄 Flexible**: Works with production (`api.remotolist.com`) or local development
- **📊 Telemetry**: Anonymous usage tracking (opt-in) to help improve
- **🔧 CLI Tools**: Commands for testing, diagnostics, and management

---

## Installation & Setup

### Prerequisites

- **Node.js 18+** (or just npx)
- **Claude Desktop** (latest version)
- **RemotoList Account** with an MCP API Key

### Easy Setup (Recommended)

```bash
# One command setup (using npx)
npx remotolist-mcp setup

# Or install globally first
npm install -g remotolist-mcp
remotolist-mcp setup
```

The interactive wizard will:
1. Ask for your API key
2. Configure everything automatically
3. Set up Claude Desktop
4. No environment variables needed!

### Manual Setup (Alternative)

If you prefer manual setup:

1. **Install globally** (optional but recommended):
   ```bash
   npm install -g remotolist-mcp
   ```

2. **Get your API Key**:
   - Visit: https://remotolist.com/recruiters/mcp/
   - Copy your MCP API Key (starts with `cj_mcp_`)

3. **Run setup wizard**:
   ```bash
   # Using npx (no installation needed)
   npx remotolist-mcp setup
   
   # Or if installed globally
   remotolist-mcp setup
   ```

4. **Follow the prompts**:
   - Enter your API key
   - Choose SSE URL (default: `https://api.remotolist.com/mcp/sse/`)
   - The wizard configures Claude Desktop automatically

5. **Restart Claude Desktop**

---

## Usage

Once configured, just use Claude normally:

```
Claude: What can I help you with?

You: Search for Python developers with Django experience

Claude: I'll search for Python developers with Django experience for you...
[Uses the RemotoList MCP search tool]
```

### Available Tools

- **`search_candidates`** - Search candidates with natural language queries
  - Example: "Find Python developers with 3+ years experience"
  - Returns: Matching candidates with scores and details

- **`get_candidate_profile`** - Get detailed information about a specific candidate
  - Example: "Show me the full profile for candidate 123"
  - Returns: Complete CV, skills, experience, availability, etc.

---

## CLI Commands

```bash
# Using npx (no installation needed)
npx remotolist-mcp [command]

# Or install globally first
npm install -g remotolist-mcp
remotolist-mcp [command]

# Commands:
# Interactive setup wizard
npx remotolist-mcp setup

# Show current configuration
npx remotolist-mcp config

# Test connection to RemotoList
npx remotolist-mcp test

# Diagnose and fix issues
npx remotolist-mcp doctor

# Manage telemetry settings
npx remotolist-mcp telemetry --enable
npx remotolist-mcp telemetry --disable

# Show help
npx remotolist-mcp help
```

---

## Configuration

Configuration is stored in `~/.remotolist/config.json`:

```json
{
  "apiKey": "cj_mcp_...",
  "sseUrl": "https://api.remotolist.com/mcp/sse/",
  "version": "1.0.0",
  "installationId": "uuid-v4",
  "createdAt": "2025-03-12T10:30:00Z",
  "lastUpdated": "2025-03-12T10:30:00Z",
  "telemetryOptIn": true
}
```

### Configuration Locations

- **Main config**: `~/.remotolist/config.json`
- **Claude Desktop**: Automatically configured during setup
- **Telemetry preferences**: `~/.remotolist/telemetry-opt-in.json`

---

## Telemetry

RemotoList MCP includes optional anonymous telemetry to help improve the product.

**We track:**
- Installation and setup events
- Error types (not messages)
- Usage counts (not content)
- Platform information (OS, version)

**We do NOT track:**
- Your search queries or candidate data
- Personal information
- API keys or sensitive data
- Specific error messages

**To manage telemetry:**
```bash
# Enable telemetry
npx remotolist-mcp telemetry --enable

# Disable telemetry
npx remotolist-mcp telemetry --disable

# Check status
npx remotolist-mcp telemetry
```

---

## Troubleshooting

### "Configuration not found"
```bash
# Run the setup wizard
npx remotolist-mcp setup
```

### "Claude Desktop not found"
1. Install Claude Desktop from https://claude.ai/desktop
2. Run `npx remotolist-mcp setup` again

### "Invalid API key"
1. Get a new API key from https://remotolist.com/recruiters/mcp/
2. Run `npx remotolist-mcp setup` to update

### "Connection failed"
```bash
# Test connection
npx remotolist-mcp test

# Run diagnostics
npx remotolist-mcp doctor
```

### "MCP server not showing in Claude"
1. Make sure Claude Desktop is restarted
2. Run `npx remotolist-mcp doctor` to check configuration
3. Check Claude config file for errors

---

## Development & Local Testing

### Using Local Development Server

During setup, you can use a local development server:

```
SSE URL: http://localhost:8000/mcp/sse/
```

### Project Structure

```
src/
├── index.ts              # Main entry point
├── config-manager.ts     # Configuration management
├── claude-config.ts      # Claude Desktop integration
├── wizard.ts             # Interactive setup wizard
├── api-key-validator.ts  # API key validation
├── telemetry.ts          # Anonymous usage tracking
├── commands.ts           # CLI commands
├── bridge.ts             # SSE bridge to RemotoList
└── config.ts             # Legacy config (deprecated)
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/roylans/remotolist-mcp.git
cd remotolist-mcp

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test locally
node dist/index.js setup
```

---

## How It Works

```
Claude Desktop
    ↓ (JSON-RPC messages via stdio)
    ↓
remotolist-mcp (this package)
    ↓ (SSE over HTTPS with API key)
    ↓
RemotoList MCP Server (Django backend)
    ↓ (Semantic search with Qdrant)
    ↓
Vector Database (embeddings)
    ↓
Candidate Results
    ↓
Claude Desktop (response to user)
```

This architecture ensures:
- ✅ **Secure** - HTTPS with API key authentication
- ✅ **Fast** - Semantic search with vector embeddings
- ✅ **Scalable** - Centralized backend handles all candidates
- ✅ **Updated** - Candidate data always current
- ✅ **Private** - Your queries stay between you and RemotoList

---

## API Key Security

🔐 **Best Practices:**

1. ✅ **Store in configuration file** - Automatically handled by setup wizard
2. ✅ **File permissions** - Config files have 600 permissions (owner read/write only)
3. ✅ **Rotate regularly** - Generate new keys in dashboard
4. ✅ **Revoke old keys** - From dashboard when no longer needed
5. ❌ **Never** commit keys to git
6. ❌ **Never** share keys in screenshots or emails

---

## Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
- Check if the issue already exists in the [GitHub Issues](https://github.com/roylans/remotolist-mcp/issues)
- Provide detailed information: OS, Node.js version, error messages, steps to reproduce

### Feature Requests
- Open an issue with the "enhancement" label
- Describe the use case and expected behavior

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Ensure code quality: `npm run lint`
6. Commit with descriptive messages
7. Push to your fork
8. Open a Pull Request

### Development Setup
```bash
# Clone and install
git clone https://github.com/roylans/remotolist-mcp.git
cd remotolist-mcp
npm install

# Build
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Code Style
- Use TypeScript with strict mode
- Follow existing code patterns
- Add tests for new features
- Update documentation
- Keep commits focused and atomic

## Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

### Enforcement
Instances of abusive behavior may be reported to the project maintainers. All complaints will be reviewed and investigated.

## Support

- 📖 **Documentation**: https://docs.remotolist.com/mcp
- 🐛 **Report bugs**: https://github.com/roylans/remotolist-mcp/issues
- 💬 **Discord**: https://discord.gg/remotolist
- 📧 **Email**: support@remotolist.com

---

## License

MIT License © 2025 RemotoList. See [LICENSE](LICENSE) file for details.

---

## Changelog

### v1.0.0 (2025-03-12)
- ✨ Complete rewrite with interactive setup wizard
- ✅ No environment variables required
- 🔧 Automatic Claude Desktop configuration
- 📊 Optional anonymous telemetry
- 🩺 Diagnostic tools (`doctor` command)
- 🚀 One-command installation: `npx remotolist-mcp setup`

---

**Happy recruiting! 🚀**