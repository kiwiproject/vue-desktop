// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get the current directory in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    plugins: {
      "typescript-eslint": tseslint.plugin
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.app.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      "no-undef": "off",
    }
  },
  eslintConfigPrettier
);
