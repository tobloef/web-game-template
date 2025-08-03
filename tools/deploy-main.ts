#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const BUILD_DIR = "dist"; // Change this to your build output directory
const GH_PAGES_DIR = "gh-pages";

/**
 * Remove all files and directories in the gh-pages root except 'pr' directory
 */
function clearRootDirectory(): void {
  const items = fs.readdirSync(GH_PAGES_DIR);

  for (const item of items) {
    if (item === "pr" || item === ".git") continue;

    const itemPath = path.join(GH_PAGES_DIR, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(itemPath);
    }
  }

  console.log("✓ Cleared root directory (preserved PR folders)");
}

/**
 * Copy build files to gh-pages root
 */
function copyBuildToRoot(): void {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error(`Build directory '${BUILD_DIR}' does not exist`);
  }

  const copyRecursive = (src: string, dest: string): void => {
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
    copyRecursive(path.join(BUILD_DIR, item), path.join(GH_PAGES_DIR, item));
  }

  console.log("✓ Copied build files to root");
}

// Main execution
try {
  clearRootDirectory();
  copyBuildToRoot();
  console.log("✅ Main deployment completed successfully");
} catch (error) {
  console.error(
    "❌ Deployment failed:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}
