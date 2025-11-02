// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT for GitHub Pages under /veins-of-power-app/
  base: "/veins-of-power-app/",
  build: { outDir: "docs" }, // publish folder Pages uses
});
