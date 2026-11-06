import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { markdown } from "./plugins/markdown.ts";

// archivos de public/ sin hash en el nombre: un día de caché y después se revalidan
// en segundo plano (/assets/* ya sale con hash e "immutable")
const publicCache = {
    headers: {
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
};

export default defineConfig({
    server: { port: 3000 },
    plugins: [
        markdown(),
        tanstackStart(),
        nitro({
            routeRules: {
                "/icons/**": publicCache,
                "/favicon.ico": publicCache,
                "/pgp.asc": publicCache,
                "/robots.txt": publicCache,
            },
        }),
        viteReact(),
    ],
});
