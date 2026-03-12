#!/usr/bin/env node
export interface Config {
    apiKey: string;
    sseUrl: string;
    version: string;
    installationId: string;
    createdAt: string;
    lastUpdated: string;
    telemetryOptIn?: boolean;
}
export interface ValidationResult {
    valid: boolean;
    plan?: string;
    message?: string;
}
export declare class ConfigManager {
    private configDir;
    private configPath;
    private telemetryOptInPath;
    private config;
    constructor();
    load(): Promise<Config>;
    exists(): boolean;
    save(config: Partial<Config>): Promise<void>;
    delete(): Promise<void>;
    getConfigPath(): string;
    getTelemetryOptIn(): boolean;
    setTelemetryOptIn(optIn: boolean): void;
    validateApiKeyFormat(apiKey: string): ValidationResult;
    validateSseUrlFormat(sseUrl: string): ValidationResult;
}
//# sourceMappingURL=config-manager.d.ts.map