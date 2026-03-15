#!/usr/bin/env node

/**
 * API Key Validator for RemotoList MCP
 * 
 * Validates API keys against the RemotoList server
 * with fallback to basic format validation.
 */

import { ConfigManager, ValidationResult } from './config-manager.js';

/**
 * Validate API key against RemotoList server
 */
export async function validateApiKey(apiKey: string): Promise<ValidationResult> {
  const configManager = new ConfigManager();
  
  // First, validate basic format
  const formatValidation = configManager.validateApiKeyFormat(apiKey);
  if (!formatValidation.valid) {
    return formatValidation;
  }

  // Try to validate with server if we have a URL
  try {
    // We need to get the SSE URL from config or use default
    let sseUrl = 'https://remotolist.com/mcp/sse/';
    
    // Try to load existing config to get the URL
    try {
      const config = await configManager.load();
      sseUrl = config.sseUrl;
    } catch {
      // If no config exists, use default
    }

    // Extract base URL for validation endpoint
    const baseUrl = sseUrl.replace('/mcp/sse/', '');
    const validationUrl = `${baseUrl}/mcp/validate-key/`;
    
    console.log(`🔍 Validating API key against: ${baseUrl}`);
    
    // Try to validate with server
    const response = await fetch(validationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ apiKey })
    });

    if (response.ok) {
      const result = await response.json() as { valid?: boolean; plan?: string; message?: string };
      return {
        valid: result.valid === true,
        plan: result.plan || 'unknown',
        message: result.message
      };
    } else {
      // Server responded with error, but we got a response
      return {
        valid: false,
        message: `Server returned ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    // Network error or server unreachable
    console.log('⚠️  Could not reach validation server, using format validation only.');
    
    // Fallback to format validation
    return {
      valid: formatValidation.valid,
      plan: 'unknown',
      message: 'Server unreachable - using format validation only'
    };
  }
}

/**
 * Test connection to SSE endpoint
 * For SSE streams, we only need to verify the connection opens successfully,
 * we don't need to wait for the stream to complete (which would be infinite).
 */
export async function testConnection(apiKey: string, sseUrl: string): Promise<ValidationResult> {
  try {
    console.log(`🔍 Testing connection to: ${sseUrl}`);

    // Create a separate controller for the response check
    const responseController = new AbortController();
    // Set a longer timeout (30s) for establishing the connection
    const responseTimeout = setTimeout(() => {
      console.log('⏱️  Connection test timeout reached, aborting...');
      responseController.abort();
    }, 30000);

    try {
      const response = await fetch(sseUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'text/event-stream'
        },
        signal: responseController.signal
      });

      clearTimeout(responseTimeout);

      // For SSE, the stream is infinite, so we just check that we got a response
      // No need to read/close the body since the request will be abandoned
      if (response.ok) {
        return {
          valid: true,
          message: 'Connection successful'
        };
      } else {
        return {
          valid: false,
          message: `Connection failed: ${response.status} ${response.statusText}`
        };
      }
    } finally {
      clearTimeout(responseTimeout);
      responseController.abort();
    }
  } catch (error) {
    // Distinguish between abort/timeout and other errors
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('aborted') || message.includes('abort')) {
      return {
        valid: false,
        message: 'Connection timeout - server not responding'
      };
    }
    return {
      valid: false,
      message: `Connection error: ${message}`
    };
  }
}

/**
 * Get API key information (if available from server)
 */
export async function getApiKeyInfo(apiKey: string): Promise<{
  valid: boolean;
  plan?: string;
  limits?: {
    searches: number;
    used: number;
    remaining: number;
  };
  expiresAt?: string;
}> {
  try {
    const configManager = new ConfigManager();
    
    // Try to load config to get URL
    let sseUrl = 'https://remotolist.com/mcp/sse/';
    try {
      const config = await configManager.load();
      sseUrl = config.sseUrl;
    } catch {
      // Use default
    }

    // Extract base URL
    const baseUrl = sseUrl.replace('/mcp/sse/', '');
    const infoUrl = `${baseUrl}/mcp/key-info/`;
    
    const response = await fetch(infoUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (response.ok) {
      const result = await response.json() as { valid?: boolean };
      return {
        valid: result.valid === true
      };
    } else {
      return {
        valid: false
      };
    }
  } catch {
    return {
      valid: false
    };
  }
}