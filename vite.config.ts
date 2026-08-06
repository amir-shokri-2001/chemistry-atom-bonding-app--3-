import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built site works when hosted under a sub-path
  // (e.g. https://<user>.github.io/<repo>/ on GitHub Pages).
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  server: {
    host: true,
    allowedHosts: true,
  },
  build: {
    // Build from the source template so the root index.html stays a
    // self-contained production build that GitHub Pages can serve directly.
    rollupOptions: {
      input: path.resolve(__dirname, "index.template.html"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
