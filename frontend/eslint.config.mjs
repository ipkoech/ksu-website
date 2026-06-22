import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      "**/.next/**",
      "**/.next.docker-owned-*/**",
      "**/.next-codex/**",
      "**/out/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/next-env.d.ts",
    ],
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    settings: {
      next: {
        rootDir: ["apps/admin/", "apps/web/", "apps/library/", "apps/research/"],
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  }),
];
