import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Astro resolves `@/*` from tsconfig.json. The runner reads that same file instead
// of holding a second copy of the mapping, which would drift out of agreement.
const projectDir = fileURLToPath(new URL(".", import.meta.url));
const { compilerOptions } = JSON.parse(
  readFileSync(path.join(projectDir, "tsconfig.json"), "utf8"),
) as { compilerOptions: { baseUrl?: string; paths: Record<string, string[]> } };

const baseDir = path.resolve(projectDir, compilerOptions.baseUrl ?? ".");

const alias = Object.entries(compilerOptions.paths).map(([pattern, targets]) => ({
  find: new RegExp(`^${pattern.replace(/\*$/, "")}`),
  replacement: path.resolve(baseDir, targets[0].replace(/\*$/, "")) + path.sep,
}));

export default defineConfig({
  resolve: { alias },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
