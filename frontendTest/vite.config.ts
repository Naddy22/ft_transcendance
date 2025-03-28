import { defineConfig } from "vite";

export default defineConfig({
  // root: "./", // Ensures paths are relative to the project root
  build: { 
    outDir: "dist", // The directory where built files go
    rollupOptions: {
      input: "index.html",  // Explicitly tells Rollup to start from index.html
    },
  },
});
