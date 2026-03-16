#!/usr/bin/env node

/**
 * Test script for RemotoList MCP setup
 * This simulates user input for testing
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Test API key (invalid for testing)
const testApiKey = 'cj_mcp_test_key_1234567890';
const testSseUrl = 'http://localhost:8000/mcp/sse/';

console.log('🧪 Testing RemotoList MCP setup wizard...');
console.log('');

// Run the setup command
const child = spawn('node', ['dist/index.js', 'setup'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const rl = readline.createInterface({
  input: child.stdout,
  terminal: false
});

let step = 0;

rl.on('line', (line) => {
  console.log(`[OUTPUT] ${line}`);
  
  // Simulate user input based on wizard prompts
  if (line.includes('Enter your API key:')) {
    console.log(`[INPUT] ${testApiKey}`);
    child.stdin.write(`${testApiKey}\n`);
    step = 1;
  } else if (line.includes('Enter SSE URL')) {
    console.log(`[INPUT] ${testSseUrl}`);
    child.stdin.write(`${testSseUrl}\n`);
    step = 2;
  } else if (line.includes('Share anonymous usage data')) {
    console.log('[INPUT] n');
    child.stdin.write('n\n');
    step = 3;
  }
});

child.stderr.on('data', (data) => {
  console.log(`[ERROR] ${data.toString()}`);
});

child.on('close', (code) => {
  console.log(`\n✅ Setup wizard exited with code: ${code}`);
  
  // Check if configuration was created
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(require('os').homedir(), '.remotolist', 'config.json');
  
  if (fs.existsSync(configPath)) {
    console.log('✅ Configuration file created successfully');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(`   API Key: ${config.apiKey.substring(0, 10)}...`);
    console.log(`   SSE URL: ${config.sseUrl}`);
  } else {
    console.log('❌ Configuration file not created');
  }
  
  process.exit(code);
});

// Handle timeout
setTimeout(() => {
  console.log('\n⏰ Setup wizard timeout');
  child.kill();
  process.exit(1);
}, 10000);