// electron.vite.config.ts
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
var __electron_vite_injected_dirname = "C:\\Users\\Jimbo\\Desktop\\WhoDownloads";
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      outDir: "out/main"
    }
  },
  preload: {
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/preload/index.ts"),
          youtubeWebview: resolve(__electron_vite_injected_dirname, "src/preload/youtubeWebview.ts")
        }
      }
    }
  },
  renderer: {
    root: resolve(__electron_vite_injected_dirname, "src/renderer"),
    build: {
      outDir: resolve(__electron_vite_injected_dirname, "out/renderer")
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};
