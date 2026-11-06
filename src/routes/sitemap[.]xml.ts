import { createFileRoute } from "@tanstack/react-router";
import { posts } from "../posts";
import { SITE_URL } from "../site";

// páginas públicas
const pages = ["/", "/blog", ...posts.map((post) => `/blog/${post.name}`)];

export const Route = createFileRoute("/sitemap.xml")({
    server: {
        handlers: {
            GET: () => {
                const urls = pages
                    .map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`)
                    .join("\n");
                const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
                return new Response(xml, {
                    headers: {
                        "content-type": "application/xml; charset=utf-8",
                        "cache-control": "public, max-age=3600",
                    },
                });
            },
        },
    },
});
