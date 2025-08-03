import { readFileSync } from "fs";
import { execSync } from "child_process";

interface PackageJson {
  version: string;
}

function compareVersions(current: string, base: string): boolean {
  const currentParts = current.split(".").map(Number);
  const baseParts = base.split(".").map(Number);

  // Pad arrays to same length with zeros
  const maxLength = Math.max(currentParts.length, baseParts.length);
  while (currentParts.length < maxLength) currentParts.push(0);
  while (baseParts.length < maxLength) baseParts.push(0);

  // Compare each part
  for (let i = 0; i < maxLength; i++) {
    if (currentParts[i]! > baseParts[i]!) return true;
    if (currentParts[i]! < baseParts[i]!) return false;
  }

  return false; // versions are equal
}

async function main() {
  try {
    // Get base branch from GitHub Actions environment
    const baseBranch = process.env.GITHUB_BASE_REF || "main";

    // Read current package.json
    const currentPackageJson: PackageJson = JSON.parse(
      readFileSync("package.json", "utf-8"),
    );
    const currentVersion = currentPackageJson.version;

    // Fetch the base branch
    execSync(`git fetch origin ${baseBranch}`, { stdio: "inherit" });

    // Get package.json from base branch
    const basePackageJsonContent = execSync(
      `git show origin/${baseBranch}:package.json`,
      { encoding: "utf-8" },
    );

    const basePackageJson: PackageJson = JSON.parse(basePackageJsonContent);
    const baseVersion = basePackageJson.version;

    console.log(`Base version: ${baseVersion}`);
    console.log(`Current version: ${currentVersion}`);

    if (!compareVersions(currentVersion, baseVersion)) {
      console.error("\n❌ Version bump required!");
      console.error(
        `The version in package.json must be higher than ${baseVersion}`,
      );
      process.exit(1);
    }

    console.log("\n✅ Version has been bumped!");
  } catch (error) {
    console.error("Error checking version:", error);
    process.exit(1);
  }
}

main();
