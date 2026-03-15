#!/usr/bin/env node

/**
 * RemotoList MCP Client
 *
 * SSE Bridge connecting Claude Desktop to RemotoList AI Candidate Search
 *
 * This executable bridges stdio (Claude) to the remote MCP server via SSE
 *
 * Usage:
 *   npx remotolist-mcp [command]
 *
 * Commands:
 *   setup                    Interactive setup wizard
 *   config                   Show current configuration
 *   test                     Test connection to RemotoList
 *   doctor                   Diagnose and fix issues
 *   telemetry [--enable|--disable]  Manage telemetry settings
 *   update                   Update configuration
 *   uninstall                Remove configuration
 *   help                     Show this help message
 *
 * Without command: Starts the MCP bridge
 */

import { connectBridge } from './bridge.js';
import { Commands } from './commands.js';
import { ConfigManager } from './config-manager.js';
import { trackEvent, TelemetryEvents } from './telemetry.js';

const VERSION = '1.0.1';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Handle commands
  if (args.length > 0) {
    await handleCommand(args);
    return;
  }
  
  // No command provided - start bridge or run setup
  await startBridgeOrSetup();
}

/**
 * Handle CLI commands
 */
async function handleCommand(args: string[]): Promise<void> {
  const commands = new Commands();
  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case 'setup':
      await commands.setup(commandArgs);
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

/**
 * Start bridge or run setup if no configuration exists
 */
async function startBridgeOrSetup(): Promise<void> {
  const configManager = new ConfigManager();
  
  try {
    // Try to load configuration
    const config = await configManager.load();
    
    console.error(`[RemotoList MCP] v${VERSION}`);
    console.error(`[RemotoList MCP] Starting bridge to ${config.sseUrl}...`);
    
    // Track bridge start
    await trackEvent(TelemetryEvents.BRIDGE_START, {
      sseUrl: config.sseUrl
    });
    
    // Start the bridge
    await connectBridge({
      sseUrl: config.sseUrl,
      apiKey: config.apiKey
    });
    
  } catch (error) {
    // Configuration not found or invalid
    console.error('');
    console.error('❌ RemotoList MCP is not configured.');
    console.error('');
    
    // Check if it's a configuration error
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
      
      // Ask if user wants to run setup now
      console.error('Would you like to run the setup wizard now? (Y/n)');
      
      // In a real implementation, we would read from stdin
      // For now, we'll just exit with instructions
      console.error('');
      console.error('Run \'npx remotolist-mcp setup\' to configure.');
    } else {
      console.error(`Error: ${message}`);
      console.error('');
      console.error('Run \'remotolist-mcp doctor\' to diagnose issues.');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('\n[RemotoList MCP] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n[RemotoList MCP] Terminated');
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
