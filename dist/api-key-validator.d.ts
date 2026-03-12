#!/usr/bin/env node
import { ValidationResult } from './config-manager.js';
export declare function validateApiKey(apiKey: string): Promise<ValidationResult>;
export declare function testConnection(apiKey: string, sseUrl: string): Promise<ValidationResult>;
export declare function getApiKeyInfo(apiKey: string): Promise<{
    valid: boolean;
    plan?: string;
    limits?: {
        searches: number;
        used: number;
        remaining: number;
    };
    expiresAt?: string;
}>;
//# sourceMappingURL=api-key-validator.d.ts.map