/*
 * Build + publish freekreditrm10.com to Cloudflare Pages (Direct Upload).
 *
 *   node deploy.mjs
 *
 * The Pages project "freekreditrm10-site" is NOT Git-connected (the dashboard
 * Git flow needs an Administrator role this account does not have), so pushing
 * to GitHub does not deploy. Run this after committing content changes.
 *
 * It runs build.mjs, copies the site into a temp folder without the build
 * tooling / sources, and uploads that folder.
 */
import { execSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const STAGE = join(tmpdir(), "fkr10-deploy");
const DROP = new Set(["_source", "brand-src", "build.mjs", "deploy.mjs", "wrangler.jsonc", "README.md", ".git", ".gitignore", ".assetsignore", "node_modules"]);

execSync("node build.mjs", { cwd: ROOT, stdio: "inherit" });

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });
for (const entry of readdirSync(ROOT)) {
  if (DROP.has(entry)) continue;
  cpSync(join(ROOT, entry), join(STAGE, entry), { recursive: true });
}

execSync(
  `npx --yes wrangler@latest pages deploy "${STAGE}" --project-name=freekreditrm10-site --branch=main --commit-dirty=true`,
  { cwd: ROOT, stdio: "inherit" }
);
