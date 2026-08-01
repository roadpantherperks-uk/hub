import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  { ignores: [".next", "node_modules", "dist"] },
  {
    ...js.configs.recommended,
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
  },
  eslintPluginPrettier,
];
