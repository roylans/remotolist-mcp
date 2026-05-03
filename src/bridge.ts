import fetch from 'node-fetch';
import { createInterface } from 'readline';
import { trackEvent, TelemetryEvents } from './telemetry.js';

interface BridgeConfig {
  apiUrl: string;
  apiKey: string;
  timeout?: number;
}

/**
 * Streamable HTTP Bridge: Connects stdio (Claude) to RemotoList MCP Server
 *
 * Simple, stateless architecture:
 * - Single POST /mcp/ endpoint for all JSON-RPC requests
 * - Request-response pattern with direct HTTP POST
 * - No sessions, no handshake, no coordination needed
 * - Works seamlessly with multiple workers
 */
export async function connectBridge(config: BridgeConfig): Promise<void> {
  const { apiUrl, apiKey } = config;

  if (!apiUrl || !apiKey) {
    throw new Error('API URL and API key are required');
  }

  console.error('[RemotoList MCP] Starting bridge to MCP server');
  console.error(`[RemotoList MCP] Server: ${apiUrl}`);

  try {
    const headers: Record<string, string> = {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    };

    console.error('[RemotoList MCP] Connected and ready');

    // Handle stdin (Claude -> Server)
    const rl = createInterface({
      input: process.stdin,
      terminal: false,
    });

    rl.on('line', (line) => {
      void (async () => {
        if (!line.trim()) return;

        try {
          // Parse the JSON-RPC message from Claude
          const message = JSON.parse(line);
          const requestId = message.id || 'no-id';
          const method = message.method || 'unknown';

          // Track search events (anonymous)
          if (method === 'tools/call' && message.params?.name === 'search_candidates') {
            await trackEvent(TelemetryEvents.SEARCH, {
              tool: 'search_candidates'
              // Note: We don't track the actual query content
            });
          }

          // Send POST request to MCP server
          const startTime = Date.now();
          console.error(`[RemotoList MCP] [${requestId}] → ${method}`);
          if (process.env.DEBUG === '1') {
            console.error(`[RemotoList MCP] [${requestId}] Request: ${JSON.stringify(message, null, 2)}`);
          }

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: line,
          });

          const duration = Date.now() - startTime;

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Server returned ${response.status}: ${response.statusText}\nBody: ${errorBody}`);
          }

          const responseData = await response.text();

          // Only parse and send response if we got a body (not for notifications)
          if (responseData && responseData.trim()) {
            const responseJson = JSON.parse(responseData);
            // Write response to stdout for Claude
            console.error(`[RemotoList MCP] [${requestId}] ← ${response.status} (${duration}ms)`);
            if (process.env.DEBUG === '1') {
              console.error(`[RemotoList MCP] [${requestId}] Response: ${JSON.stringify(responseJson, null, 2)}`);
            }
            process.stdout.write(JSON.stringify(responseJson) + '\n');
          } else {
            // Notification received (204 No Content), no response to send
            console.error(`[RemotoList MCP] [${requestId}] ✓ Notification acknowledged (${duration}ms)`);
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[RemotoList MCP] ✗ Error: ${errorMsg}`);

          try {
            // Send error response to Claude
            const parsedLine = JSON.parse(line);
            const errorResponse = {
              jsonrpc: '2.0',
              id: parsedLine.id || null,
              error: {
                code: -32603,
                message: String(error)
              }
            };
            process.stdout.write(JSON.stringify(errorResponse) + '\n');
          } catch {
            // If we can't even parse the original message, just log it
            console.error('[RemotoList MCP] Failed to send error response');
          }
        }
      })();
    });

    // Handle graceful shutdown
    rl.on('close', () => {
      console.error('[RemotoList MCP] Stdin closed, shutting down');
      process.exit(0);
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[RemotoList MCP] Fatal Error: ${message}`);

    // Track error
    await trackEvent(TelemetryEvents.BRIDGE_ERROR, {
      error: message,
      apiUrl
    });

    process.exit(1);
  }
}
