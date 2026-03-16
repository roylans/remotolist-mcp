import fetch from 'node-fetch';
import { createInterface } from 'readline';
import { trackEvent, TelemetryEvents } from './telemetry.js';

interface BridgeConfig {
  sseUrl: string;
  apiKey: string;
  timeout?: number;
}

/**
 * SSE Bridge: Connects stdio (Claude) to RemotoList MCP Server
 * Reactively processes chunks like the Python bridge to avoid buffering.
 */
export async function connectBridge(config: BridgeConfig): Promise<void> {
  const { sseUrl, apiKey } = config;

  if (!sseUrl || !apiKey) {
    throw new Error('SSE URL and API key are required');
  }

  const headers: Record<string, string> = {
    'X-API-Key': apiKey,
    'Accept': 'text/event-stream',
  };

  console.error('[RemotoList MCP] Connecting to SSE endpoint...');
  console.error(`[RemotoList MCP] URL: ${sseUrl}`);

  try {
    const response = await fetch(sseUrl, { headers });

    if (!response.ok) {
      const error = new Error(`Server returned ${response.status}: ${response.statusText}`);
      await trackEvent(TelemetryEvents.BRIDGE_ERROR, {
        status: response.status,
        statusText: response.statusText,
        sseUrl
      });
      throw error;
    }

    console.error('[RemotoList MCP] Connected to SSE stream');

    let postUrl: string | null = null;
    const decoder = new TextDecoder();
    let buffer = '';

    // 1. Handle STDIN (Claude -> Server)
    const rl = createInterface({
      input: process.stdin,
      terminal: false,
    });

      rl.on('line', (line) => {
        void (async () => {
          if (!line.trim()) return;

          // Wait for handshake to complete
          if (!postUrl) {
            console.error('[RemotoList MCP] Waiting for endpoint URL before sending message...');
            return;
          }

          try {
            await fetch(postUrl, {
              method: 'POST',
              headers: {
                ...headers,
                'Content-Type': 'application/json',
              },
              body: line,
            });
            
            // Track search events (anonymous)
            try {
              const message = JSON.parse(line);
              if (message.method === 'tools/call' && message.params?.name === 'search_candidates') {
                await trackEvent(TelemetryEvents.SEARCH, {
                  tool: 'search_candidates'
                  // Note: We don't track the actual query content
                });
              }
            } catch {
              // Ignore parsing errors
            }
          } catch (error) {
            console.error(`[RemotoList MCP] Error forwarding message to POST endpoint: ${error}`);
          }
        })();
      });

    // 2. Process SSE stream (Server -> Claude)
    const stream = response.body as NodeJS.ReadableStream;

    for await (const chunk of stream) {
      const chunkBuffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      const decoded = decoder.decode(chunkBuffer, { stream: true });
      buffer += decoded;

      // Split on both \n\n and \r\n\r\n (handle both LF and CRLF)
      const separator = buffer.includes('\r\n\r\n') ? '\r\n\r\n' : '\n\n';

      while (buffer.includes(separator)) {
        const [block, rest] = buffer.split(separator, 2);
        buffer = rest;

        // Parse SSE event block (event: type\ndata: content)
        // Normalize line endings to just \n
        const lines = block.replace(/\r\n/g, '\n').split('\n').filter(l => l.length > 0);

        let eventType = '';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6).trim();
          }
        }

        // Handle different event types
        if (eventType === 'endpoint' && eventData) {
          // Handshake: server sends the POST endpoint path
          if (!postUrl) {
            postUrl = new URL(eventData, sseUrl).href;
            console.error(`[RemotoList MCP] Handshake complete. Post URL: ${postUrl}`);
          }
        } else if (eventType === 'message' && eventData && postUrl) {
          // Forward MCP JSON-RPC messages to Claude's stdout
          process.stdout.write(eventData + '\n');
        }
      }
    }

    console.error('[RemotoList MCP] SSE stream closed by server');
    process.exit(0);

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[RemotoList MCP] Fatal Error: ${message}`);
    
    // Track error
    await trackEvent(TelemetryEvents.BRIDGE_ERROR, {
      error: message,
      sseUrl
    });
    
    process.exit(1);
  }
}
