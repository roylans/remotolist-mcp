#!/usr/bin/env node

/**
 * CLI Commands for RemotoList MCP
 * 
 * Command-line interface for managing RemotoList MCP configuration.
 */

import { ConfigManager } from './config-manager.js';
import { ClaudeConfigManager } from './claude-config.js';
import { validateApiKey, testConnection } from './api-key-validator.js';
import { SetupWizard } from './wizard.js';
import { 
  trackEvent, 
  enableTelemetry, 
  disableTelemetry, 
  getTelemetryStatus,
  TelemetryEvents 
} from './telemetry.js';

export class Commands {
  private configManager: ConfigManager;
  private claudeConfigManager: ClaudeConfigManager;

  constructor() {
    this.configManager = new ConfigManager();
    this.claudeConfigManager = new ClaudeConfigManager();
  }

  /**
   * Run setup wizard
   */
  async setup(): Promise<void> {
    console.log('🚀 Starting RemotoList MCP setup...');
    await trackEvent(TelemetryEvents.SETUP_START);
    
    const wizard = new SetupWizard();
    const success = await wizard.run();
    
    if (success) {
      console.log('✅ Setup completed successfully!');
    } else {
      console.log('❌ Setup failed.');
      process.exit(1);
    }
  }

  /**
   * Show current configuration
   */
  async config(): Promise<void> {
    try {
      const config = await this.configManager.load();
      
      console.log('');
      console.log('📋 RemotoList MCP Configuration');
      console.log('===============================');
      console.log('');
      console.log(`Config file: ${this.configManager.getConfigPath()}`);
      console.log('');
      console.log('Settings:');
      console.log(`  API Key: ${config.apiKey.substring(0, 10)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
      console.log(`  SSE URL: ${config.sseUrl}`);
      console.log(`  Version: ${config.version}`);
      console.log(`  Installation ID: ${config.installationId}`);
      console.log(`  Created: ${config.createdAt}`);
      console.log(`  Updated: ${config.lastUpdated}`);
      console.log(`  Telemetry: ${config.telemetryOptIn ? 'Enabled' : 'Disabled'}`);
      console.log('');
      
      // Check Claude configuration
      const claudeConfigured = this.claudeConfigManager.isRemotoListConfigured();
      console.log('Claude Desktop:');
      console.log(`  Installed: ${this.claudeConfigManager.isClaudeInstalled() ? 'Yes' : 'No'}`);
      console.log(`  Configured: ${claudeConfigured ? 'Yes' : 'No'}`);
      if (claudeConfigured) {
        console.log(`  Config file: ${this.claudeConfigManager.getConfigPathForUser()}`);
      }
      
    } catch (error) {
      console.error(`❌ No configuration found. Run 'remotolist-mcp setup' first.`);
      process.exit(1);
    }
  }

  /**
   * Test connection to RemotoList server
   */
  async test(): Promise<void> {
    try {
      const config = await this.configManager.load();

      console.log('');
      console.log('🔌 Testing Connection');
      console.log('====================');
      console.log('');
      console.log(`API Key: ${config.apiKey.substring(0, 10)}...`);
      console.log(`SSE URL: ${config.sseUrl}`);
      console.log('');

      // Test API key validation
      console.log('1. Validating API key...');
      const validation = await validateApiKey(config.apiKey);
      if (validation.valid) {
        console.log(`   ✅ Valid (Plan: ${validation.plan || 'unknown'})`);
      } else {
        console.log(`   ❌ Invalid: ${validation.message}`);
      }

      // Test SSE connection
      console.log('2. Testing SSE connection...');
      const connectionTest = await testConnection(config.apiKey, config.sseUrl);
      if (connectionTest.valid) {
        console.log(`   ✅ Connected successfully`);
      } else {
        console.log(`   ❌ Connection failed: ${connectionTest.message}`);
      }

      console.log('');
      if (validation.valid && connectionTest.valid) {
        console.log('🎉 All tests passed! RemotoList MCP is ready to use.');
      } else {
        console.log('⚠️  Some tests failed. Check your configuration.');
        process.exit(1);
      }

    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Run \'remotolist-mcp setup\' to configure first.');
      process.exit(1);
    }
  }

  /**
   * Run diagnostics and fix issues
   */
  async doctor(): Promise<void> {
    console.log('');
    console.log('🩺 RemotoList MCP Doctor');
    console.log('=======================');
    console.log('');
    
    let issuesFound = 0;
    
    // Check 1: Configuration file
    console.log('1. Checking configuration...');
    if (this.configManager.exists()) {
      try {
        const config = await this.configManager.load();
        console.log(`   ✅ Configuration file exists and is valid`);
        console.log(`      API Key: ${config.apiKey.substring(0, 10)}...`);
        console.log(`      SSE URL: ${config.sseUrl}`);
      } catch (error) {
        console.log(`   ❌ Configuration file is invalid: ${error instanceof Error ? error.message : String(error)}`);
        issuesFound++;
      }
    } else {
      console.log('   ❌ Configuration file not found');
      issuesFound++;
    }
    
    // Check 2: Claude Desktop
    console.log('2. Checking Claude Desktop...');
    if (this.claudeConfigManager.isClaudeInstalled()) {
      console.log('   ✅ Claude Desktop is installed');
      
      if (this.claudeConfigManager.isRemotoListConfigured()) {
        console.log('   ✅ RemotoList MCP is configured in Claude');
      } else {
        console.log('   ❌ RemotoList MCP is not configured in Claude');
        issuesFound++;
      }
    } else {
      console.log('   ❌ Claude Desktop not found');
      console.log('      Install from: https://claude.ai/desktop');
      issuesFound++;
    }
    
    // Check 3: Connection test
    console.log('3. Testing connection...');
    if (this.configManager.exists()) {
      try {
        const config = await this.configManager.load();
        const connectionTest = await testConnection(config.apiKey, config.sseUrl);

        if (connectionTest.valid) {
          console.log('   ✅ Connection to RemotoList server successful');
        } else {
          console.log(`   ❌ Connection failed: ${connectionTest.message}`);
          issuesFound++;
        }
      } catch (error) {
        console.log(`   ❌ Could not test connection: ${error instanceof Error ? error.message : String(error)}`);
        issuesFound++;
      }
    } else {
      console.log('   ⚠️  Skipping connection test (no configuration)');
    }
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Issues found: ${issuesFound}`);
    
    if (issuesFound === 0) {
      console.log('🎉 Everything looks good!');
    } else {
      console.log('');
      console.log('💡 Suggested fixes:');
      
      if (!this.configManager.exists()) {
        console.log('   • Run: remotolist-mcp setup');
      }
      
      if (!this.claudeConfigManager.isClaudeInstalled()) {
        console.log('   • Install Claude Desktop from https://claude.ai/desktop');
      }
      
      if (this.claudeConfigManager.isClaudeInstalled() && !this.claudeConfigManager.isRemotoListConfigured()) {
        console.log('   • Run: remotolist-mcp setup (to configure Claude)');
      }
      
      console.log('');
      console.log('Run \'remotolist-mcp setup\' to fix configuration issues.');
    }
  }

  /**
   * Manage telemetry settings
   */
  async telemetry(action?: string): Promise<void> {
    console.log('');
    console.log('📊 Telemetry Settings');
    console.log('====================');
    console.log('');
    
    const status = getTelemetryStatus();
    
    if (!action) {
      // Show current status
      console.log(`Current status: ${status.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`Events in queue: ${status.queueLength}`);
      console.log('');
      console.log('Telemetry helps us improve RemotoList MCP by collecting anonymous usage data.');
      console.log('');
      console.log('We track:');
      console.log('• Installation and setup events');
      console.log('• Error types (not messages)');
      console.log('• Usage counts (not content)');
      console.log('');
      console.log('We do NOT track:');
      console.log('• Your search queries or candidate data');
      console.log('• Personal information');
      console.log('• API keys or sensitive data');
      console.log('');
      console.log('Commands:');
      console.log('  remotolist-mcp telemetry --enable    Enable telemetry');
      console.log('  remotolist-mcp telemetry --disable   Disable telemetry');
      
    } else if (action === '--enable' || action === 'enable') {
      enableTelemetry();
      await trackEvent(TelemetryEvents.TELEMETRY_ENABLE);
      console.log('✅ Telemetry enabled. Thank you for helping us improve!');
      
    } else if (action === '--disable' || action === 'disable') {
      disableTelemetry();
      await trackEvent(TelemetryEvents.TELEMETRY_DISABLE);
      console.log('✅ Telemetry disabled.');
      
    } else {
      console.error(`❌ Unknown action: ${action}`);
      console.error('Use: --enable or --disable');
      process.exit(1);
    }
  }

  /**
   * Update configuration
   */
  async update(): Promise<void> {
    console.log('');
    console.log('🔄 Updating Configuration');
    console.log('=======================');
    console.log('');
    
    try {
      const currentConfig = await this.configManager.load();
      
      console.log('Current configuration:');
      console.log(`  API Key: ${currentConfig.apiKey.substring(0, 10)}...`);
      console.log(`  SSE URL: ${currentConfig.sseUrl}`);
      console.log('');
      
      console.log('Enter new values (press Enter to keep current):');
      
      // We would need readline here, but for simplicity we'll just
      // direct to the setup wizard
      console.log('');
      console.log('To update configuration, run: remotolist-mcp setup');
      console.log('This will guide you through updating your settings.');
      
    } catch (error) {
      console.error(`❌ No configuration found. Run 'remotolist-mcp setup' first.`);
      process.exit(1);
    }
  }

  /**
   * Uninstall RemotoList MCP
   */
  async uninstall(): Promise<void> {
    console.log('');
    console.log('🗑️  Uninstalling RemotoList MCP');
    console.log('==============================');
    console.log('');
    
    console.log('This will:');
    console.log('1. Remove configuration files');
    console.log('2. Remove RemotoList from Claude Desktop configuration');
    console.log('3. Clear telemetry data');
    console.log('');
    console.log('⚠️  This action cannot be undone!');
    console.log('');
    
    // In a real implementation, we would ask for confirmation
    // For now, we'll just show what would happen
    console.log('To uninstall:');
    console.log('1. Delete configuration: rm -rf ~/.remotolist/');
    console.log('2. Remove from Claude Desktop config:');
    console.log(`   Edit: ${this.claudeConfigManager.getConfigPathForUser()}`);
    console.log('   Remove the "remotolist" entry from "mcpServers"');
    console.log('');
    console.log('Or run the setup wizard again to reconfigure.');
    
    await trackEvent(TelemetryEvents.UNINSTALL);
  }

  /**
   * Show help
   */
  async help(): Promise<void> {
    console.log('');
    console.log('🚀 RemotoList MCP - AI Candidate Search for Claude Desktop');
    console.log('==========================================================');
    console.log('');
    console.log('Usage: remotolist-mcp [command]');
    console.log('');
    console.log('Commands:');
    console.log('  setup                    Interactive setup wizard');
    console.log('  config                   Show current configuration');
    console.log('  test                     Test connection to RemotoList');
    console.log('  doctor                   Diagnose and fix issues');
    console.log('  telemetry [--enable|--disable]  Manage telemetry settings');
    console.log('  update                   Update configuration');
    console.log('  uninstall                Remove configuration');
    console.log('  help                     Show this help message');
    console.log('');
    console.log('Quick Start:');
    console.log('  1. npx remotolist-mcp setup');
    console.log('  2. Enter your API key from https://remotolist.com/recruiters/mcp/');
    console.log('  3. Restart Claude Desktop');
    console.log('');
    console.log('Example queries in Claude:');
    console.log('  • "Find Python developers in Cuba"');
    console.log('  • "Search for React developers with TypeScript experience"');
    console.log('  • "Show me candidates available for remote work"');
    console.log('');
    console.log('Documentation: https://docs.remotolist.com/mcp');
    console.log('Issues: https://github.com/remotolist/remotolist/issues');
    console.log('');
  }
}