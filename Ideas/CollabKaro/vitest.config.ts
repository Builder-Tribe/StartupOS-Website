import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["server/src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    setupFiles: ["./server/test/setup.ts"],
    fileParallelism: false
  }
});