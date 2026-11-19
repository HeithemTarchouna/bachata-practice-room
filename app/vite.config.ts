import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// The app is built into ONE html file, so it can be opened by double-clicking it.
export default defineConfig({
  plugins: [viteSingleFile()],
  build: { target: "es2022", chunkSizeWarningLimit: 2000 },
  test: { include: ["tests/**/*.test.ts"], testTimeout: 120000 },
} as any);
