#!/usr/bin/env node

import { execSync } from "child_process";
import { readdir, stat } from "fs/promises";
import { join, relative } from "path";
import { gzip } from "zlib";
import { promisify } from "util";
import { createReadStream } from "fs";

const gzipAsync = promisify(gzip);

// Configuration
const BUILD_COMMAND = "npm run build";
const OUTPUT_FOLDER = "dist";
const FILE_CATEGORIES = [
  { name: "JavaScript", pattern: /\.js$/ },
  { name: "CSS", pattern: /\.css$/ },
  { name: "HTML", pattern: /\.html$/ },
  { name: "Source Maps", pattern: /\.map$/ },
  { name: "Images", pattern: /\.(png|jpg|jpeg|gif|svg|ico)$/i },
  { name: "Fonts", pattern: /\.(woff|woff2|ttf|otf|eot)$/i },
];

interface FileStats {
  [category: string]: {
    size: number;
    gzipSize: number;
  };
}

interface BuildStats {
  categories: FileStats;
  total: {
    size: number;
    gzipSize: number;
  };
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

async function getGzipSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(chunk));
      }
    });
    stream.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const compressed = await gzipAsync(buffer);
        resolve(compressed.length);
      } catch (err) {
        reject(err);
      }
    });
    stream.on("error", reject);
  });
}

async function calculateBuildStats(outputPath: string): Promise<BuildStats> {
  const files = await getAllFiles(outputPath);
  const stats: FileStats = {};

  // Initialize categories
  for (const category of FILE_CATEGORIES) {
    stats[category.name] = { size: 0, gzipSize: 0 };
  }
  stats["Other"] = { size: 0, gzipSize: 0 };

  // Process each file
  for (const file of files) {
    const relativePath = relative(outputPath, file);
    const size = await getFileSize(file);
    const gzipSize = await getGzipSize(file);

    let categorized = false;
    for (const category of FILE_CATEGORIES) {
      if (category.pattern.test(relativePath)) {
        stats[category.name]!.size += size;
        stats[category.name]!.gzipSize += gzipSize;
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      stats["Other"].size += size;
      stats["Other"].gzipSize += gzipSize;
    }
  }

  // Calculate totals
  const total = { size: 0, gzipSize: 0 };
  for (const category of Object.values(stats)) {
    total.size += category.size;
    total.gzipSize += category.gzipSize;
  }

  return { categories: stats, total };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatChange(
  oldSize: number,
  newSize: number,
): { bytes: string; percent: string } {
  const diff = newSize - oldSize;
  const percent = oldSize === 0 ? 100 : (diff / oldSize) * 100;

  const bytesStr = diff > 0 ? `+${formatBytes(diff)}` : formatBytes(diff);
  const percentStr =
    diff > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;

  return { bytes: bytesStr, percent: percentStr };
}

function generateMarkdownTable(
  oldStats: BuildStats,
  newStats: BuildStats,
  isGzip: boolean,
): string {
  const type = isGzip ? "Gzipped" : "Uncompressed";
  const lines: string[] = [];

  lines.push(`### ${type} Size Comparison`);
  lines.push("");
  lines.push(
    "| Category | Old Size | New Size | Change (bytes) | Change (%) |",
  );
  lines.push(
    "|----------|----------|----------|----------------|------------|",
  );

  // Sort categories by name, but keep "Other" at the end
  const categories = Object.keys(oldStats.categories).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  for (const category of categories) {
    const oldSize = isGzip
      ? oldStats.categories[category]?.gzipSize || 0
      : oldStats.categories[category]?.size || 0;
    const newSize = isGzip
      ? newStats.categories[category]?.gzipSize || 0
      : newStats.categories[category]?.size || 0;
    const change = formatChange(oldSize, newSize);

    lines.push(
      `| ${category} | ${formatBytes(oldSize)} | ${formatBytes(newSize)} | ${change.bytes} | ${change.percent} |`,
    );
  }

  // Total row
  const oldTotal = isGzip ? oldStats.total.gzipSize : oldStats.total.size;
  const newTotal = isGzip ? newStats.total.gzipSize : newStats.total.size;
  const totalChange = formatChange(oldTotal, newTotal);

  lines.push(
    `| **Total** | **${formatBytes(oldTotal)}** | **${formatBytes(newTotal)}** | **${totalChange.bytes}** | **${totalChange.percent}** |`,
  );

  return lines.join("\n");
}

async function runBuild(branch: string): Promise<BuildStats> {
  console.log(`Checking out ${branch}...`);
  execSync(`git checkout ${branch}`, { stdio: "inherit" });

  console.log(`Running build command: ${BUILD_COMMAND}`);
  execSync(BUILD_COMMAND, { stdio: "inherit" });

  console.log(`Calculating build stats for ${OUTPUT_FOLDER}...`);
  return await calculateBuildStats(OUTPUT_FOLDER);
}

async function main() {
  const baseBranch = process.argv[2];
  const headBranch = process.argv[3];

  if (!baseBranch || !headBranch) {
    console.error(
      "Usage: node build-size-compare.ts <base-branch> <head-branch>",
    );
    process.exit(1);
  }

  try {
    // Save current branch
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();

    // Get stats for base branch
    const baseStats = await runBuild(baseBranch);

    // Get stats for head branch
    const headStats = await runBuild(headBranch);

    // Restore original branch
    execSync(`git checkout ${currentBranch}`, { stdio: "inherit" });

    // Generate comparison tables
    const uncompressedTable = generateMarkdownTable(
      baseStats,
      headStats,
      false,
    );
    const gzipTable = generateMarkdownTable(baseStats, headStats, true);

    // Output the comparison
    console.log("\n## Build Size Comparison\n");
    console.log(uncompressedTable);
    console.log("\n");
    console.log(gzipTable);

    // Write to GitHub Actions output if running in CI
    if (process.env.GITHUB_OUTPUT) {
      const output = `## Build Size Comparison\n\n${uncompressedTable}\n\n${gzipTable}`;
      // Use EOF delimiter for multiline output
      execSync(`echo "comparison<<EOF" >> $GITHUB_OUTPUT`);
      execSync(`echo "${output}" >> $GITHUB_OUTPUT`);
      execSync(`echo "EOF" >> $GITHUB_OUTPUT`);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
