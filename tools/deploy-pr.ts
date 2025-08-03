#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const BUILD_DIR = 'dist'; // Change this to your build output directory
const GH_PAGES_DIR = 'gh-pages';
const BRANCH_NAME = process.env.BRANCH_NAME;

if (!BRANCH_NAME) {
  console.error('❌ BRANCH_NAME environment variable is required');
  process.exit(1);
}

/**
 * Sanitize branch name for safe directory naming
 */
function sanitizeBranchName(branchName) {
  return branchName.replace(/[^a-zA-Z0-9._-]/g, '-');
}

/**
 * Deploy PR build to dedicated directory
 */
function deployPRBuild() {
  const safeBranchName = sanitizeBranchName(BRANCH_NAME);
  const prDir = path.join(GH_PAGES_DIR, 'pr', safeBranchName);
  
  // Create PR directory
  fs.mkdirSync(prDir, { recursive: true });
  
  // Clear existing content in PR directory
  const existingItems = fs.readdirSync(prDir);
  for (const item of existingItems) {
    const itemPath = path.join(prDir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(itemPath);
    }
  }
  
  // Copy build files
  const copyRecursive = (src, dest) => {
    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const items = fs.readdirSync(src);
      for (const item of items) {
        copyRecursive(path.join(src, item), path.join(dest, item));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  const items = fs.readdirSync(BUILD_DIR);
  for (const item of items) {
    copyRecursive(path.join(BUILD_DIR, item), path.join(prDir, item));
  }
  
  console.log(`✓ Deployed PR build to /pr/${safeBranchName}`);
  
  // Set the safe branch name as an environment variable for the workflow
  const envFile = process.env.GITHUB_ENV;
  if (envFile) {
    fs.appendFileSync(envFile, `SAFE_BRANCH_NAME=${safeBranchName}\n`);
  }
}

// Main execution
try {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error(`Build directory '${BUILD_DIR}' does not exist`);
  }
  
  deployPRBuild();
  console.log('✅ PR deployment completed successfully');
} catch (error) {
  console.error('❌ PR deployment failed:', error.message);
  process.exit(1);
}