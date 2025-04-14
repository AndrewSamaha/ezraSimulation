#!/usr/bin/env node

/**
 * Script to run the vector reproduction test with proper transpilation
 */
const { execSync } = require('child_process');

try {
  console.log('Running vector reproduction test...');
  // Use ts-node with the project's tsconfig
  execSync('npx ts-node -r tsconfig-paths/register src/tests/vectorTest.ts', { 
    stdio: 'inherit',
    cwd: process.cwd() 
  });
} catch (error) {
  console.error('Error running test:', error);
}
