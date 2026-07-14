import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      "node_modules/**",
      "packages/crosswing/**",
      "packages/submodules/**",
      "submodules/**",
      "packages/**/lib/**",
      "packages/**/dist/**",
    ],
  },
});
