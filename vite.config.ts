import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: set base to your repo name for project pages
export default defineConfig({
  plugins: [react()],
  base: "/veins-of-power-app/", // ← matches https://vegardmj.github.io/veins-of-power-app/
  build: { outDir: "docs" },
});
