#!/usr/bin/env node
import { connectBridge } from './bridge.js';
import { Commands } from './commands.js';
import { ConfigManager } from './config-manager.js';
import { trackEvent, TelemetryEvents } from './telemetry.js';
const VERSION = '1.0.0';
async function main() {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        await handleCommand(args);
        return;
    }
    await startBridgeOrSetup();
}
async function handleCommand(args) {
    const commands = new Commands();
    const command = args[0];
    switch (command) {
        case 'setup':
            await commands.setup();
            break;
        case 'config':
            await commands.config();
            break;
        case 'test':
            await commands.test();
            break;
        case 'doctor':
            await commands.doctor();
            break;
        case 'telemetry':
            await commands.telemetry(args[1]);
            break;
        case 'update':
            await commands.update();
            break;
        case 'uninstall':
            await commands.uninstall();
            break;
        case 'help':
        case '--help':
        case '-h':
            await commands.help();
            break;
        case '--version':
        case '-v':
            console.log(`remotolist-mcp v${VERSION}`);
            break;
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.error('');
            console.error('Run \'remotolist-mcp help\' for available commands.');
            process.exit(1);
    }
}
async function startBridgeOrSetup() {
    const configManager = new ConfigManager();
    try {
        const config = await configManager.load();
        console.error(`[RemotoList MCP] v${VERSION}`);
        console.error(`[RemotoList MCP] Starting bridge to ${config.sseUrl}...`);
        await trackEvent(TelemetryEvents.BRIDGE_START, {
            sseUrl: config.sseUrl
        });
        await connectBridge({
            sseUrl: config.sseUrl,
            apiKey: config.apiKey
        });
    }
    catch (error) {
        console.error('');
        console.error('❌ RemotoList MCP is not configured.');
        console.error('');
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('Configuration file not found') || message.includes('Failed to load configuration')) {
            console.error('📋 Setup Required');
            console.error('================');
            console.error('');
            console.error('To set up RemotoList MCP:');
            console.error('');
            console.error('1. Run the setup wizard:');
            console.error('   npx remotolist-mcp setup');
            console.error('');
            console.error('2. Or configure manually:');
            console.error('   • Get API key from: https://remotolist.com/recruiters/mcp/');
            console.error('   • Run: remotolist-mcp setup');
            console.error('');
            console.error('Would you like to run the setup wizard now? (Y/n)');
            console.error('');
            console.error('Run \'npx remotolist-mcp setup\' to configure.');
        }
        else {
            console.error(`Error: ${message}`);
            console.error('');
            console.error('Run \'remotolist-mcp doctor\' to diagnose issues.');
        }
        process.exit(1);
    }
}
process.on('SIGINT', () => {
    console.error('\n[RemotoList MCP] Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.error('\n[RemotoList MCP] Terminated');
    process.exit(0);
});
main();
//# sourceMappingURL=index.js.map