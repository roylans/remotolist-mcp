#!/usr/bin/env node
import readline from 'readline';
import { ConfigManager } from './config-manager.js';
import { ClaudeConfigManager } from './claude-config.js';
import { validateApiKey } from './api-key-validator.js';
import { trackEvent } from './telemetry.js';
export class SetupWizard {
    rl;
    configManager;
    claudeConfigManager;
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.configManager = new ConfigManager();
        this.claudeConfigManager = new ClaudeConfigManager();
    }
    async run() {
        try {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║                 RemotoList MCP Setup Wizard                    ║');
            console.log('╚════════════════════════════════════════════════════════════════╝');
            console.log('');
            console.log('This wizard will help you connect Claude Desktop to RemotoList.');
            console.log('You will need your RemotoList API key.');
            console.log('');
            await this.checkClaudeDesktop();
            const apiKey = await this.getApiKey();
            const sseUrl = await this.getSseUrl();
            const isValid = await this.validateConfiguration(apiKey, sseUrl);
            if (!isValid) {
                console.log('❌ Configuration validation failed. Please check your settings.');
                return false;
            }
            await this.saveConfiguration(apiKey, sseUrl);
            const claudeConfigured = await this.configureClaudeDesktop();
            if (!claudeConfigured) {
                console.log('⚠️  Could not configure Claude Desktop automatically.');
                console.log('   You may need to configure it manually.');
            }
            await this.askTelemetryOptIn();
            this.showSuccessMessage(claudeConfigured);
            await trackEvent('setup_complete', { claudeConfigured });
            return true;
        }
        catch (error) {
            console.error(`❌ Setup failed: ${error instanceof Error ? error.message : String(error)}`);
            await trackEvent('setup_error', { error: error instanceof Error ? error.message : String(error) });
            return false;
        }
        finally {
            this.rl.close();
        }
    }
    async checkClaudeDesktop() {
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
        }
        else {
            console.log('✅ Claude Desktop found.');
        }
    }
    async getApiKey() {
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
            const formatValidation = this.configManager.validateApiKeyFormat(apiKey);
            if (!formatValidation.valid) {
                console.log(`❌ ${formatValidation.message}`);
                console.log('');
                continue;
            }
            console.log('⏳ Validating API key...');
            const validation = await validateApiKey(apiKey);
            if (validation.valid) {
                console.log(`✅ API key validated successfully!`);
                if (validation.plan) {
                    console.log(`   Plan: ${validation.plan}`);
                }
                isValid = true;
            }
            else {
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
    async getSseUrl() {
        console.log('');
        console.log('🌐 SSE URL Setup');
        console.log('================');
        console.log('');
        console.log('Enter the SSE endpoint URL for RemotoList MCP.');
        console.log('');
        console.log('Common options:');
        console.log('• Production: https://api.remotolist.com/mcp/sse/');
        console.log('• Development: http://localhost:8000/mcp/sse/');
        console.log('• Custom: Your custom endpoint URL');
        console.log('');
        let sseUrl = '';
        let isValid = false;
        while (!isValid) {
            sseUrl = await this.askQuestion('Enter SSE URL (press Enter for default): ');
            if (!sseUrl.trim()) {
                sseUrl = 'https://api.remotolist.com/mcp/sse/';
            }
            const urlValidation = this.configManager.validateSseUrlFormat(sseUrl);
            if (!urlValidation.valid) {
                console.log(`❌ ${urlValidation.message}`);
                console.log('');
                continue;
            }
            console.log(`✅ Using SSE URL: ${sseUrl}`);
            isValid = true;
        }
        return sseUrl;
    }
    async validateConfiguration(apiKey, sseUrl) {
        console.log('');
        console.log('🔧 Validating configuration...');
        const apiKeyValidation = this.configManager.validateApiKeyFormat(apiKey);
        if (!apiKeyValidation.valid) {
            console.log(`❌ API key validation failed: ${apiKeyValidation.message}`);
            return false;
        }
        const urlValidation = this.configManager.validateSseUrlFormat(sseUrl);
        if (!urlValidation.valid) {
            console.log(`❌ SSE URL validation failed: ${urlValidation.message}`);
            return false;
        }
        console.log('✅ Configuration validated successfully!');
        return true;
    }
    async saveConfiguration(apiKey, sseUrl) {
        console.log('');
        console.log('💾 Saving configuration...');
        try {
            await this.configManager.save({
                apiKey,
                sseUrl
            });
            console.log(`✅ Configuration saved to: ${this.configManager.getConfigPath()}`);
        }
        catch (error) {
            console.error(`❌ Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async configureClaudeDesktop() {
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
            }
            else {
                console.log('❌ Failed to configure Claude Desktop.');
                return false;
            }
        }
        catch (error) {
            console.error(`❌ Error configuring Claude Desktop: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
    async askTelemetryOptIn() {
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
        }
        else {
            console.log('✅ Telemetry disabled. You can enable it later with: remotolist-mcp telemetry --enable');
        }
    }
    showSuccessMessage(claudeConfigured) {
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
        }
        else {
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
    askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }
    close() {
        this.rl.close();
    }
}
//# sourceMappingURL=wizard.js.map