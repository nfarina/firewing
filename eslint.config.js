// import reactCompiler from "eslint-plugin-react-compiler";
import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import reactCompiler from "./.eslint/lib/eslint-plugin-react-compiler.js";
// import { ErrorSeverity } from "babel-plugin-react-compiler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  includeIgnoreFile(gitignorePath),
  {
    ignores: ["packages/workers/.wrangler/*"],
  },
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "prefer-const": "off",
      "no-empty-pattern": "off",
      "react-compiler/react-compiler": [
        "error",
        // {
        //   reportableLevels: new Set([ErrorSeverity.InvalidReact]),
        //   __unstable_donotuse_reportAllBailouts: true,
        // },
      ],
    },
  },
);
