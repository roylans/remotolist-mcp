#!/usr/bin/env node
import { ConfigManager } from './config-manager.js';
export async function validateApiKey(apiKey) {
    const configManager = new ConfigManager();
    const formatValidation = configManager.validateApiKeyFormat(apiKey);
    if (!formatValidation.valid) {
        return formatValidation;
    }
    try {
        let sseUrl = 'https://api.remotolist.com/mcp/sse/';
        try {
            const config = await configManager.load();
            sseUrl = config.sseUrl;
        }
        catch {
        }
        const baseUrl = sseUrl.replace('/mcp/sse/', '');
        const validationUrl = `${baseUrl}/mcp/validate-key/`;
        console.log(`🔍 Validating API key against: ${baseUrl}`);
        const response = await fetch(validationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({ apiKey })
        });
        if (response.ok) {
            const result = await response.json();
            return {
                valid: result.valid === true,
                plan: result.plan || 'unknown',
                message: result.message
            };
        }
        else {
            return {
                valid: false,
                message: `Server returned ${response.status}: ${response.statusText}`
            };
        }
    }
    catch (error) {
        console.log('⚠️  Could not reach validation server, using format validation only.');
        return {
            valid: formatValidation.valid,
            plan: 'unknown',
            message: 'Server unreachable - using format validation only'
        };
    }
}
export async function testConnection(apiKey, sseUrl) {
    try {
        console.log(`🔍 Testing connection to: ${sseUrl}`);
        const response = await fetch(sseUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
                'Accept': 'text/event-stream'
            }
        });
        if (response.ok) {
            return {
                valid: true,
                message: 'Connection successful'
            };
        }
        else {
            return {
                valid: false,
                message: `Connection failed: ${response.status} ${response.statusText}`
            };
        }
    }
    catch (error) {
        return {
            valid: false,
            message: `Connection error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
export async function getApiKeyInfo(apiKey) {
    try {
        const configManager = new ConfigManager();
        let sseUrl = 'https://api.remotolist.com/mcp/sse/';
        try {
            const config = await configManager.load();
            sseUrl = config.sseUrl;
        }
        catch {
        }
        const baseUrl = sseUrl.replace('/mcp/sse/', '');
        const infoUrl = `${baseUrl}/mcp/key-info/`;
        const response = await fetch(infoUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey
            }
        });
        if (response.ok) {
            return await response.json();
        }
        else {
            return {
                valid: false
            };
        }
    }
    catch {
        return {
            valid: false
        };
    }
}
//# sourceMappingURL=api-key-validator.js.map