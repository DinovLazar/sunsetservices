import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sanity Studio build output (`npm run studio:build` / `studio:deploy`).
    // Gitignored; its 500KB+ minified vendor chunks OOM eslint if scanned.
    "dist/**",
    // Claude Code harness state. Gitignored; stale session worktrees under
    // .claude/worktrees/ carry their own .next/ build chunks, which the
    // top-level ".next/**" ignore does not cover — scanning them buries the
    // "lint 0 errors" phase gate under ~1200 generated-code errors.
    ".claude/**",
  ]),
]);

export default eslintConfig;
