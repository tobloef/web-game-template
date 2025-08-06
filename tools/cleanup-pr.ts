#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const GH_PAGES_DIR = "gh-pages";
const BRANCH_NAME = process.env.BRANCH_NAME;

if (!BRANCH_NAME) {
  console.error("❌ BRANCH_NAME environment variable is required");
  process.exit(1);
}

/**
 * Sanitize branch name for safe directory naming
 */
function sanitizeBranchName(branchName) {
  return branchName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

/**
 * Remove PR directory
 */
function cleanupPR() {
  const safeBranchName = sanitizeBranchName(BRANCH_NAME);
  const prDir = path.join(GH_PAGES_DIR, "pr", safeBranchName);

  if (fs.existsSync(prDir)) {
    fs.rmSync(prDir, { recursive: true, force: true });
    console.log(`✓ Removed PR directory: /pr/${safeBranchName}`);
  } else {
    console.log(
      `ℹ️  PR directory not found: /pr/${safeBranchName} (may have been already cleaned up)`,
    );
  }
}

// Main execution
try {
  cleanupPR();
  console.log("✅ PR cleanup completed successfully");
} catch (error) {
  console.error("❌ PR cleanup failed:", error.message);
  process.exit(1);
}
