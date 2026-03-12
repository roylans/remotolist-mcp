#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
export class ConfigManager {
    configDir;
    configPath;
    telemetryOptInPath;
    config = null;
    constructor() {
        this.configDir = path.join(os.homedir(), '.remotolist');
        this.configPath = path.join(this.configDir, 'config.json');
        this.telemetryOptInPath = path.join(this.configDir, 'telemetry-opt-in.json');
    }
    async load() {
        if (this.config) {
            return this.config;
        }
        try {
            if (!fs.existsSync(this.configPath)) {
                throw new Error('Configuration file not found');
            }
            const configData = fs.readFileSync(this.configPath, 'utf8');
            const parsedConfig = JSON.parse(configData);
            if (fs.existsSync(this.telemetryOptInPath)) {
                const telemetryData = fs.readFileSync(this.telemetryOptInPath, 'utf8');
                const telemetryPrefs = JSON.parse(telemetryData);
                parsedConfig.telemetryOptIn = telemetryPrefs.optIn === true;
            }
            this.config = parsedConfig;
            return this.config;
        }
        catch (error) {
            throw new Error(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    exists() {
        return fs.existsSync(this.configPath);
    }
    async save(config) {
        try {
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
            }
            let existingConfig = {};
            if (fs.existsSync(this.configPath)) {
                try {
                    const existingData = fs.readFileSync(this.configPath, 'utf8');
                    existingConfig = JSON.parse(existingData);
                }
                catch {
                }
            }
            const now = new Date().toISOString();
            const mergedConfig = {
                apiKey: config.apiKey || existingConfig.apiKey || '',
                sseUrl: config.sseUrl || existingConfig.sseUrl || 'https://api.remotolist.com/mcp/sse/',
                version: config.version || existingConfig.version || '1.0.0',
                installationId: config.installationId || existingConfig.installationId || uuidv4(),
                createdAt: config.createdAt || existingConfig.createdAt || now,
                lastUpdated: now,
                telemetryOptIn: config.telemetryOptIn !== undefined ? config.telemetryOptIn : existingConfig.telemetryOptIn,
            };
            if (!mergedConfig.apiKey) {
                throw new Error('API key is required');
            }
            if (!mergedConfig.sseUrl) {
                throw new Error('SSE URL is required');
            }
            fs.writeFileSync(this.configPath, JSON.stringify(mergedConfig, null, 2), { mode: 0o600 });
            this.config = mergedConfig;
            if (config.telemetryOptIn !== undefined) {
                fs.writeFileSync(this.telemetryOptInPath, JSON.stringify({ optIn: config.telemetryOptIn }, null, 2), { mode: 0o600 });
            }
        }
        catch (error) {
            throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async delete() {
        try {
            if (fs.existsSync(this.configPath)) {
                fs.unlinkSync(this.configPath);
            }
            if (fs.existsSync(this.telemetryOptInPath)) {
                fs.unlinkSync(this.telemetryOptInPath);
            }
            this.config = null;
        }
        catch (error) {
            throw new Error(`Failed to delete configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getConfigPath() {
        return this.configPath;
    }
    getTelemetryOptIn() {
        if (!fs.existsSync(this.telemetryOptInPath)) {
            return false;
        }
        try {
            const telemetryData = fs.readFileSync(this.telemetryOptInPath, 'utf8');
            const telemetryPrefs = JSON.parse(telemetryData);
            return telemetryPrefs.optIn === true;
        }
        catch {
            return false;
        }
    }
    setTelemetryOptIn(optIn) {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
        }
        fs.writeFileSync(this.telemetryOptInPath, JSON.stringify({ optIn }, null, 2), { mode: 0o600 });
        if (this.config) {
            this.config.telemetryOptIn = optIn;
        }
    }
    validateApiKeyFormat(apiKey) {
        if (!apiKey) {
            return { valid: false, message: 'API key is required' };
        }
        if (!apiKey.startsWith('cj_mcp_')) {
            return {
                valid: false,
                message: 'API key should start with cj_mcp_'
            };
        }
        if (apiKey.length < 20) {
            return {
                valid: false,
                message: 'API key appears to be too short'
            };
        }
        return { valid: true, plan: 'unknown' };
    }
    validateSseUrlFormat(sseUrl) {
        if (!sseUrl) {
            return { valid: false, message: 'SSE URL is required' };
        }
        try {
            const url = new URL(sseUrl);
            if (!['http:', 'https:'].includes(url.protocol)) {
                return { valid: false, message: 'SSE URL must be http:// or https://' };
            }
            return { valid: true };
        }
        catch {
            return { valid: false, message: 'SSE URL is not a valid URL' };
        }
    }
}
//# sourceMappingURL=config-manager.js.map