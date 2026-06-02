import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const tubetraceDir = path.join(repoRoot, "apps", "tubetrace");
const tubetraceOutDir = path.join(tubetraceDir, "dist", "public");
const webPublicDir = path.join(repoRoot, "apps", "web", "public");
const embedTargetDir = path.join(webPublicDir, "tubetrace-app");
const tubetraceAssetsDir = path.join(tubetraceOutDir, "assets");

const viteCmd =
  process.platform === "win32"
    ? `"${path.join(tubetraceDir, "node_modules", ".bin", "vite.cmd")}"`
    : path.join(tubetraceDir, "node_modules", ".bin", "vite");

mkdirSync(webPublicDir, { recursive: true });

const buildResult = spawnSync(`${viteCmd} build --config vite.config.ts`, {
  cwd: tubetraceDir,
  stdio: "inherit",
  env: {
    ...process.env,
    BASE_PATH: "/tubetrace-app/"
  },
  shell: true
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

if (existsSync(embedTargetDir)) {
  rmSync(embedTargetDir, { recursive: true, force: true });
}

mkdirSync(embedTargetDir, { recursive: true });
cpSync(tubetraceOutDir, embedTargetDir, { recursive: true });

const assetNames = readdirSync(path.join(embedTargetDir, "assets"));
const jsAsset = assetNames.find((name) => name.endsWith(".js"));
const cssAsset = assetNames.find((name) => name.endsWith(".css"));

if (!jsAsset || !cssAsset) {
  throw new Error("Could not find TubeTrace embed assets after build.");
}

cpSync(path.join(embedTargetDir, "assets", jsAsset), path.join(embedTargetDir, "embed.js"));
cpSync(path.join(embedTargetDir, "assets", cssAsset), path.join(embedTargetDir, "embed.css"));
