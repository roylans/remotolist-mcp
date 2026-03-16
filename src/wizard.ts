#!/usr/bin/env node

/**
 * Interactive Setup Wizard for RemotoList MCP
 * 
 * Guides users through the setup process with a friendly interface.
 */

import readline from 'readline';
import { ConfigManager } from './config-manager.js';
import { ClaudeConfigManager } from './claude-config.js';
import { validateApiKey } from './api-key-validator.js';
import { trackEvent } from './telemetry.js';

export class SetupWizard {
  private rl: readline.Interface;
  private configManager: ConfigManager;
  private claudeConfigManager: ClaudeConfigManager;
  private devMode: boolean;

  constructor(options?: { devMode?: boolean }) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.configManager = new ConfigManager();
    this.claudeConfigManager = new ClaudeConfigManager();
    this.devMode = options?.devMode ?? false;
  }

  /**
   * Run the setup wizard
   */
  async run(): Promise<boolean> {
    try {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║                 RemotoList MCP Setup Wizard                    ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('This wizard will help you connect Claude Desktop to RemotoList.');
      console.log('You will need your RemotoList API key.');
      console.log('');

      // Step 1: Check Claude Desktop
      await this.checkClaudeDesktop();

      // Step 2: Get API key
      const apiKey = await this.getApiKey();

      // Step 3: Determine SSE URL based on mode
      const sseUrl = this.determineSseUrl();

      // Step 4: Validate configuration
      const isValid = await this.validateConfiguration(apiKey, sseUrl);
      if (!isValid) {
        console.log('❌ Configuration validation failed. Please check your settings.');
        return false;
      }

      // Step 5: Save configuration
      await this.saveConfiguration(apiKey, sseUrl);

      // Step 6: Configure Claude Desktop
      const claudeConfigured = await this.configureClaudeDesktop();
      if (!claudeConfigured) {
        console.log('⚠️  Could not configure Claude Desktop automatically.');
        console.log('   You may need to configure it manually.');
      }

      // Step 7: Ask about telemetry
      await this.askTelemetryOptIn();

      // Step 8: Show success message
      this.showSuccessMessage(claudeConfigured);

      // Track setup completion
      await trackEvent('setup_complete', { claudeConfigured });

      return true;

    } catch (error) {
      console.error(`❌ Setup failed: ${error instanceof Error ? error.message : String(error)}`);
      await trackEvent('setup_error', { error: error instanceof Error ? error.message : String(error) });
      return false;
    } finally {
      this.rl.close();
    }
  }

  /**
   * Check if Claude Desktop is installed
   */
  private async checkClaudeDesktop(): Promise<void> {
    console.log('🔍 Checking for Claude Desktop...');
    
    if (!this.claudeConfigManager.isClaudeInstalled()) {
      console.log('');
      console.log('❌ Claude Desktop not found.');
      console.log('');
      console.log(this.claudeConfigManager.getInstallationInstructions());
      console.log('');
      
      const answer = await this.askQuestion('Have you installed Claude Desktop? (y/N): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('');
        console.log('Please install Claude Desktop first, then run this wizard again.');
        process.exit(1);
      }
    } else {
      console.log('✅ Claude Desktop found.');
    }
  }

  /**
   * Get API key from user
   */
  private async getApiKey(): Promise<string> {
    console.log('');
    console.log('🔑 API Key Setup');
    console.log('===============');
    console.log('');
    console.log('1. Get your API key from:');
    console.log('   https://remotolist.com/recruiters/mcp/');
    console.log('');
    console.log('2. Your API key should look like: cj_mcp_xxxxxxxxxxxxxxxx');
    console.log('');

    let apiKey = '';
    let isValid = false;

    while (!isValid) {
      apiKey = await this.askQuestion('Enter your API key: ');
      
      // Basic format validation
      const formatValidation = this.configManager.validateApiKeyFormat(apiKey);
      if (!formatValidation.valid) {
        console.log(`❌ ${formatValidation.message}`);
        console.log('');
        continue;
      }

      // Try to validate with server
      console.log('⏳ Validating API key...');
      const validation = await validateApiKey(apiKey);
      
      if (validation.valid) {
        console.log(`✅ API key validated successfully!`);
        if (validation.plan) {
          console.log(`   Plan: ${validation.plan}`);
        }
        isValid = true;
      } else {
        console.log(`❌ ${validation.message || 'Invalid API key'}`);
        console.log('');
        
        const continueAnyway = await this.askQuestion('Continue anyway? (y/N): ');
        if (continueAnyway.toLowerCase() === 'y') {
          console.log('⚠️  Continuing with unvalidated API key...');
          isValid = true;
        }
      }
    }

    return apiKey;
  }

  /**
   * Determine SSE URL based on mode (development or production)
   */
  private determineSseUrl(): string {
    if (this.devMode) {
      console.log('');
      console.log('🔧 Development Mode');
      console.log('Using local development server: http://localhost:8000/mcp/sse/');
      console.log('');
      return 'http://localhost:8000/mcp/sse/';
    }

    console.log('');
    console.log('🌐 Using production server: https://remotolist.com/mcp/sse/');
    console.log('');
    return 'https://remotolist.com/mcp/sse/';
  }

  /**
   * Validate configuration
   */
  private async validateConfiguration(apiKey: string, sseUrl: string): Promise<boolean> {
    console.log('');
    console.log('🔧 Validating configuration...');
    
    // Validate API key format
    const apiKeyValidation = this.configManager.validateApiKeyFormat(apiKey);
    if (!apiKeyValidation.valid) {
      console.log(`❌ API key validation failed: ${apiKeyValidation.message}`);
      return false;
    }

    // Validate SSE URL format
    const urlValidation = this.configManager.validateSseUrlFormat(sseUrl);
    if (!urlValidation.valid) {
      console.log(`❌ SSE URL validation failed: ${urlValidation.message}`);
      return false;
    }

    console.log('✅ Configuration validated successfully!');
    return true;
  }

  /**
   * Save configuration to file
   */
  private async saveConfiguration(apiKey: string, sseUrl: string): Promise<void> {
    console.log('');
    console.log('💾 Saving configuration...');
    
    try {
      await this.configManager.save({
        apiKey,
        sseUrl
      });
      
      console.log(`✅ Configuration saved to: ${this.configManager.getConfigPath()}`);
    } catch (error) {
      console.error(`❌ Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Configure Claude Desktop
   */
  private async configureClaudeDesktop(): Promise<boolean> {
    console.log('');
    console.log('🤖 Configuring Claude Desktop...');
    
    if (!this.claudeConfigManager.isClaudeInstalled()) {
      console.log('❌ Claude Desktop not found. Skipping configuration.');
      return false;
    }

    try {
      const configured = this.claudeConfigManager.configureRemotoListMCP();
      
      if (configured) {
        console.log('✅ Claude Desktop configured successfully!');
        console.log(`   Config file: ${this.claudeConfigManager.getConfigPathForUser()}`);
        return true;
      } else {
        console.log('❌ Failed to configure Claude Desktop.');
        return false;
      }
    } catch (error) {
      console.error(`❌ Error configuring Claude Desktop: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Ask about telemetry opt-in
   */
  private async askTelemetryOptIn(): Promise<void> {
    console.log('');
    console.log('📊 Telemetry');
    console.log('============');
    console.log('');
    console.log('Help us improve RemotoList MCP by sharing anonymous usage data.');
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

    const answer = await this.askQuestion('Share anonymous usage data to help improve? (y/N): ');
    const optIn = answer.toLowerCase() === 'y';
    
    this.configManager.setTelemetryOptIn(optIn);
    
    if (optIn) {
      console.log('✅ Thank you! Telemetry enabled.');
    } else {
      console.log('✅ Telemetry disabled. You can enable it later with: remotolist-mcp telemetry --enable');
    }
  }

  /**
   * Show success message
   */
  private showSuccessMessage(claudeConfigured: boolean): void {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                      Setup Complete!                           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('🎉 RemotoList MCP has been successfully configured!');
    console.log('');
    
    if (claudeConfigured) {
      console.log('To start using RemotoList MCP:');
      console.log('1. Restart Claude Desktop');
      console.log('2. Ask Claude to search for candidates');
      console.log('');
      console.log('Example queries:');
      console.log('• "Find Python developers in Cuba"');
      console.log('• "Search for React developers with TypeScript experience"');
      console.log('• "Show me candidates available for remote work"');
    } else {
      console.log('To configure Claude Desktop manually:');
      console.log(`1. Open: ${this.claudeConfigManager.getConfigPathForUser()}`);
      console.log('2. Add this configuration:');
      console.log('');
      console.log(JSON.stringify({
        mcpServers: {
          remotolist: {
            command: 'remotolist-mcp'
          }
        }
      }, null, 2));
      console.log('');
      console.log('3. Restart Claude Desktop');
    }
    
    console.log('');
    console.log('📚 Documentation: https://docs.remotolist.com/mcp');
    console.log('🐛 Report issues: https://github.com/remotolist/remotolist/issues');
    console.log('');
  }

  /**
   * Ask a question and return the answer
   */
  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Close the readline interface
   */
  close(): void {
    this.rl.close();
  }
}