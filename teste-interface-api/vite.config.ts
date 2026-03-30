import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/Analysts": "http://localhost:5037",
      "/Holidays": "http://localhost:5037",
      "/Occurrences": "http://localhost:5037",
      "/Regions": "http://localhost:5037",
      "/Tickets": "http://localhost:5037",
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
});
