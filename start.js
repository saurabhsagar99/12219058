#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 URL Shortener Microservice');
console.log('================================\n');

// Check if dependencies are installed
const fs = require('fs');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    const install = spawn('npm', ['install'], { stdio: 'inherit' });
    
    install.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ Dependencies installed successfully!');
            startServer();
        } else {
            console.error('\n❌ Failed to install dependencies');
            process.exit(1);
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('\n🔧 Starting server...');
    console.log('📊 Health check: http://localhost:3000/health');
    console.log('🔗 API Base: http://localhost:3000/shorturls');
    console.log('📝 Logs will be saved to: ./logs/');
    console.log('\nPress Ctrl+C to stop the server\n');
    
    const server = spawn('node', ['server.js'], { stdio: 'inherit' });
    
    server.on('close', (code) => {
        console.log(`\n👋 Server stopped with code ${code}`);
    });
} 