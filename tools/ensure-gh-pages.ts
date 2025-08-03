import { execSync } from "child_process";
import * as fs from "fs";

const ensureGhPagesBranch = () => {
  try {
    // Check if gh-pages branch exists
    execSync("git rev-parse --verify gh-pages", { stdio: "ignore" });
    console.log("gh-pages branch already exists");
    throw new Error("But we'll create it anyway!");
  } catch {
    console.log("Creating gh-pages branch...");

    // Create orphan branch
    execSync("git checkout gh-pages");

    // Remove all files
    execSync("git rm -rf .");

    // Create initial structure
    fs.mkdirSync("pr", { recursive: true });
    fs.writeFileSync(
      "index.html",
      `
<!DOCTYPE html>
<html>
<head>
    <title>GitHub Pages Root</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
    </style>
</head>
<body>
    <h1>GitHub Pages Root</h1>
    <p>Main branch deployment</p>
</body>
</html>
`.trim(),
    );

    fs.writeFileSync(".gitignore", "node_modules/\n.DS_Store\n");

    // Commit initial structure
    execSync("git add .");
    execSync('git commit -m "Initial gh-pages structure"');
    execSync("git push -u origin gh-pages");

    // Switch back to main
    execSync("git checkout main");

    console.log("✅ gh-pages branch created successfully");
  }
};

ensureGhPagesBranch();
