/**
 * DEPRECATED: Configuration management for the MCP bridge
 * This module is deprecated. Use config-manager.ts instead.
 * 
 * Loads and validates environment variables (old method)
 */

export interface Config {
  sseUrl: string;
  apiKey: string;
  timeout?: number;
  debug?: boolean;
}

/**
 * DEPRECATED: Load configuration from environment variables
 * Use ConfigManager from config-manager.ts instead.
 *
 * Required:
 *   - MCP_SSE_URL: URL to the SSE endpoint (e.g., https://api.remotolist.com/mcp/sse/)
 *   - X_API_KEY: API key for authentication (e.g., cj_mcp_...)
 *
 * Optional:
 *   - MCP_TIMEOUT: Timeout in milliseconds (default: 30000)
 *   - MCP_DEBUG: Enable debug logging (default: false)
 */
export function loadConfig(): Config {
  const sseUrl = process.env.MCP_SSE_URL;
  const apiKey = process.env.X_API_KEY;
  const timeout = process.env.MCP_TIMEOUT ? parseInt(process.env.MCP_TIMEOUT, 10) : 30000;
  const debug = process.env.MCP_DEBUG === 'true';

  // Validate required variables
  if (!sseUrl) {
    console.warn('[DEPRECATED] Environment variable MCP_SSE_URL is required.');
    console.warn('Run \'remotolist-mcp setup\' for easier configuration.');
    throw new Error(
      'Environment variable MCP_SSE_URL is required. ' +
      'Set it to your RemotoList SSE endpoint URL (e.g., https://api.remotolist.com/mcp/sse/) ' +
      'or run \'remotolist-mcp setup\' for easier configuration.'
    );
  }

  if (!apiKey) {
    console.warn('[DEPRECATED] Environment variable X_API_KEY is required.');
    console.warn('Run \'remotolist-mcp setup\' for easier configuration.');
    throw new Error(
      'Environment variable X_API_KEY is required. ' +
      'Set it to your RemotoList MCP API key (e.g., cj_mcp_...) ' +
      'or run \'remotolist-mcp setup\' for easier configuration.'
    );
  }

  // Validate URL format
  try {
    new URL(sseUrl);
  } catch {
    throw new Error(`MCP_SSE_URL is not a valid URL: ${sseUrl}`);
  }

  // Validate API key format
  if (!apiKey.startsWith('cj_mcp_')) {
    console.warn(
      '[MCP Config] Warning: API key does not start with cj_mcp_. ' +
      'This may not be a valid RemotoList API key.'
    );
  }

  if (debug) {
    console.error('[MCP Config] Debug logging enabled');
    console.error(`[MCP Config] SSE URL: ${sseUrl}`);
    console.error(`[MCP Config] API Key: ${apiKey.slice(0, 10)}...`);
    console.error(`[MCP Config] Timeout: ${timeout}ms`);
  }

  return {
    sseUrl,
    apiKey,
    timeout,
    debug,
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.sseUrl) {
    errors.push('sseUrl is required');
  } else {
    try {
      new URL(config.sseUrl);
    } catch {
      errors.push(`sseUrl is not a valid URL: ${config.sseUrl}`);
    }
  }

  if (!config.apiKey) {
    errors.push('apiKey is required');
  } else if (!config.apiKey.startsWith('cj_mcp_')) {
    errors.push('apiKey should start with cj_mcp_');
  }

  if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
    errors.push('timeout should be between 1000ms and 300000ms');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * DEPRECATED: Print setup instructions
 * Use the interactive setup wizard instead: remotolist-mcp setup
 */
export function printSetupInstructions(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           DEPRECATED: Old Setup Instructions                   ║
╚════════════════════════════════════════════════════════════════╝

⚠️  This method is deprecated. Use the interactive setup instead:

   npx remotolist-mcp setup

Old method (environment variables):

1. Get your API Key:
   Visit: https://remotolist.com/recruiters/mcp/
   Copy your MCP API Key (starts with cj_mcp_)

2. Set environment variables:

   macOS/Linux:
   $ export MCP_SSE_URL="https://api.remotolist.com/mcp/sse/"
   $ export X_API_KEY="cj_mcp_your_key_here"

   Add to ~/.zshrc or ~/.bashrc to persist:
   export MCP_SSE_URL="https://api.remotolist.com/mcp/sse/"
   export X_API_KEY="cj_mcp_your_key_here"

3. Add to Claude Desktop config:

   macOS:   ~/Library/Application Support/Claude/claude_desktop_config.json
   Windows: %APPDATA%\\Claude\\claude_desktop_config.json
   Linux:   ~/.config/Claude/claude_desktop_config.json

   Add this JSON:
   {
     "mcpServers": {
       "remotolist": {
         "command": "remotolist-mcp",
         "env": {
           "MCP_SSE_URL": "https://api.remotolist.com/mcp/sse/",
           "X_API_KEY": "cj_mcp_your_key_here"
         }
       }
     }
   }

4. Restart Claude Desktop

5. Try asking: "Find developers in Cuba with TypeScript experience"

⚠️  Recommended: Run 'npx remotolist-mcp setup' for easier setup!

Issues? Visit: https://github.com/remotolist/remotolist/issues
`);
}
