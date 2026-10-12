import tsEslint from "typescript-eslint";
import pluginNext from "@next/eslint-plugin-next";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

const baseTs = [...tsEslint.configs.recommended];

const projectRules = Object.entries(baseTs[0].rules || {})
  .filter(([k]) => k in pluginReactHooks.rules)
  .reduce((acc, [k, v]) => ((acc[k] = v), acc), {});
const projectRules2 = Object.entries(baseTs[1].rules || {})
  .filter(([k]) => k in pluginReactHooks.rules)
  .reduce((acc, [k, v]) => ((acc[k] = v), acc), {});
const projectRules3 = Object.entries(baseTs[2].rules || {})
  .filter(([k]) => k in pluginReactHooks.rules)
  .reduce((acc, [k, v]) => ((acc[k] = v), acc), {});

const nextLegacy = pluginNext.configs["recommended-legacy"];

export default [
  {
    plugins: {
      "@next/next": pluginNext,
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      ...nextLegacy.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      "import/no-extraneous-dependencies": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },
  {
    name: "next/typescript",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2022,
        projectService: { allowDefaultProject: ["*.ts", "*.tsx"] },
      },
    },
    rules: {
      ...projectRules,
      ...projectRules2,
      ...projectRules3,
      "import/no-extraneous-dependencies": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "eslint.config.mjs",
      "next.config.ts",
      "middleware.ts",
    ],
  },
];
