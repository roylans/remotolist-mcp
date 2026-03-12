#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
export class ClaudeConfigManager {
    configPath;
    backupPath = null;
    constructor() {
        this.configPath = this.getDefaultConfigPath();
    }
    getDefaultConfigPath() {
        switch (process.platform) {
            case 'darwin':
                return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
            case 'win32':
                const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
                return path.join(appData, 'Claude', 'claude_desktop_config.json');
            case 'linux':
                return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
            default:
                throw new Error(`Unsupported platform: ${process.platform}`);
        }
    }
    isClaudeInstalled() {
        const configDir = path.dirname(this.configPath);
        return fs.existsSync(configDir);
    }
    configExists() {
        return fs.existsSync(this.configPath);
    }
    load() {
        try {
            if (!this.configExists()) {
                return { mcpServers: {} };
            }
            const configData = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(configData);
        }
        catch (error) {
            throw new Error(`Failed to load Claude configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    save(config) {
        try {
            const configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            this.createBackup();
            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        }
        catch (error) {
            throw new Error(`Failed to save Claude configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    createBackup() {
        if (!this.configExists()) {
            return;
        }
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(path.dirname(this.configPath), 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            this.backupPath = path.join(backupDir, `claude_desktop_config-${timestamp}.json`);
            const configData = fs.readFileSync(this.configPath, 'utf8');
            fs.writeFileSync(this.backupPath, configData);
        }
        catch (error) {
            console.warn(`Warning: Could not create backup: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    restoreBackup() {
        if (!this.backupPath || !fs.existsSync(this.backupPath)) {
            return false;
        }
        try {
            const backupData = fs.readFileSync(this.backupPath, 'utf8');
            fs.writeFileSync(this.configPath, backupData);
            return true;
        }
        catch (error) {
            console.error(`Failed to restore backup: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
    configureRemotoListMCP() {
        try {
            const config = this.load();
            config.mcpServers = config.mcpServers || {};
            config.mcpServers.remotolist = {
                command: 'remotolist-mcp'
            };
            this.save(config);
            return true;
        }
        catch (error) {
            console.error(`Failed to configure Claude Desktop: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
    removeRemotoListMCP() {
        try {
            const config = this.load();
            if (config.mcpServers && config.mcpServers.remotolist) {
                delete config.mcpServers.remotolist;
                this.save(config);
            }
            return true;
        }
        catch (error) {
            console.error(`Failed to remove RemotoList MCP configuration: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
    isRemotoListConfigured() {
        try {
            const config = this.load();
            return !!(config.mcpServers && config.mcpServers.remotolist);
        }
        catch {
            return false;
        }
    }
    getInstallationInstructions() {
        const platform = process.platform;
        switch (platform) {
            case 'darwin':
                return 'Claude Desktop should be installed from https://claude.ai/desktop';
            case 'win32':
                return 'Claude Desktop should be installed from https://claude.ai/desktop';
            case 'linux':
                return 'Claude Desktop for Linux is available at https://claude.ai/desktop';
            default:
                return 'Please install Claude Desktop from https://claude.ai/desktop';
        }
    }
    getConfigPathForUser() {
        return this.configPath;
    }
}
//# sourceMappingURL=claude-config.js.map