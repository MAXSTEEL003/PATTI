const fs = require('fs').promises;
const path = require('path');

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function rmDir(dest) {
  try {
    // fs.rm is available in newer node; use fs.unlink + rmdir fallback
    if (fs.rm) {
      await fs.rm(dest, { recursive: true, force: true });
    } else {
      // best-effort: ignore if not present
      await fs.rmdir(dest, { recursive: true });
    }
  } catch (err) {
    // ignore
  }
}

(async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const srcDir = path.join(repoRoot, 'src');
  const outDir = path.join(repoRoot, 'dist');

  try {
    await rmDir(outDir);
    await copyDir(srcDir, outDir);
    console.log('Built site to', outDir);
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
})();
