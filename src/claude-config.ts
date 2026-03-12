#!/usr/bin/env node

/**
 * Claude Desktop Configuration Manager
 * 
 * Handles detection and configuration of Claude Desktop
 * for RemotoList MCP integration.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

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

export class ClaudeConfigManager {
  private configPath: string;
  private backupPath: string | null = null;

  constructor() {
    this.configPath = this.getDefaultConfigPath();
  }

  /**
   * Get default Claude Desktop config path based on OS
   */
  private getDefaultConfigPath(): string {
    switch (process.platform) {
      case 'darwin': // macOS
        return path.join(
          os.homedir(),
          'Library',
          'Application Support',
          'Claude',
          'claude_desktop_config.json'
        );
      
      case 'win32': // Windows
        const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
        return path.join(appData, 'Claude', 'claude_desktop_config.json');
      
      case 'linux': // Linux
        return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
      
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  /**
   * Check if Claude Desktop is installed
   */
  isClaudeInstalled(): boolean {
    const configDir = path.dirname(this.configPath);
    return fs.existsSync(configDir);
  }

  /**
   * Check if Claude config file exists
   */
  configExists(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * Load Claude configuration
   */
  load(): ClaudeConfig {
    try {
      if (!this.configExists()) {
        // Return default config if file doesn't exist
        return { mcpServers: {} };
      }

      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      throw new Error(`Failed to load Claude configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save Claude configuration
   */
  save(config: ClaudeConfig): void {
    try {
      // Ensure directory exists
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Create backup before modifying
      this.createBackup();

      // Write configuration
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save Claude configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create backup of current configuration
   */
  private createBackup(): void {
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
    } catch (error) {
      console.warn(`Warning: Could not create backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Restore from backup
   */
  restoreBackup(): boolean {
    if (!this.backupPath || !fs.existsSync(this.backupPath)) {
      return false;
    }

    try {
      const backupData = fs.readFileSync(this.backupPath, 'utf8');
      fs.writeFileSync(this.configPath, backupData);
      return true;
    } catch (error) {
      console.error(`Failed to restore backup: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Configure RemotoList MCP in Claude Desktop
   */
  configureRemotoListMCP(): boolean {
    try {
      const config = this.load();
      
      // Add or update RemotoList MCP server configuration
      config.mcpServers = config.mcpServers || {};
      config.mcpServers.remotolist = {
        command: 'remotolist-mcp'
        // No env vars - configuration is read from ~/.remotolist/config.json
      };

      this.save(config);
      return true;
    } catch (error) {
      console.error(`Failed to configure Claude Desktop: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Remove RemotoList MCP configuration from Claude Desktop
   */
  removeRemotoListMCP(): boolean {
    try {
      const config = this.load();
      
      if (config.mcpServers && config.mcpServers.remotolist) {
        delete config.mcpServers.remotolist;
        this.save(config);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to remove RemotoList MCP configuration: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Check if RemotoList MCP is already configured
   */
  isRemotoListConfigured(): boolean {
    try {
      const config = this.load();
      return !!(config.mcpServers && config.mcpServers.remotolist);
    } catch {
      return false;
    }
  }

  /**
   * Get installation instructions for user
   */
  getInstallationInstructions(): string {
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

  /**
   * Get path to Claude Desktop config for user reference
   */
  getConfigPathForUser(): string {
    return this.configPath;
  }
}