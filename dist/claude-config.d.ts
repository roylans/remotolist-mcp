#!/usr/bin/env node
export interface ClaudeConfig {
    mcpServers: {
        [key: string]: {
            command: string;
            args?: string[];
            env?: Record<string, string>;
        };
    };
    preferences?: Record<string, any>;
}
export declare class ClaudeConfigManager {
    private configPath;
    private backupPath;
    constructor();
    private getDefaultConfigPath;
    isClaudeInstalled(): boolean;
    configExists(): boolean;
    load(): ClaudeConfig;
    save(config: ClaudeConfig): void;
    private createBackup;
    restoreBackup(): boolean;
    configureRemotoListMCP(): boolean;
    removeRemotoListMCP(): boolean;
    isRemotoListConfigured(): boolean;
    getInstallationInstructions(): string;
    getConfigPathForUser(): string;
}
//# sourceMappingURL=claude-config.d.ts.map