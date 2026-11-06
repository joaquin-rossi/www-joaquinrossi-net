import { Marked, type Tokens } from "marked";
import { createHighlighter, type Highlighter } from "shiki";
import type { Plugin } from "vite";

/**
 * Convierte cada `.md` en un módulo con el frontmatter y el HTML ya renderizado
 * (con el código resaltado por Shiki). Corre en el build: ni marked ni Shiki
 * llegan al navegador.
 */
export function markdown(): Plugin {
    let highlighter: Promise<Highlighter> | undefined;

    return {
        name: "markdown",
        enforce: "pre",
        async transform(raw, id) {
            if (!id.endsWith(".md")) return;

            highlighter ??= createHighlighter({ themes: [THEME], langs: [] });
            const { data, body } = frontmatter(raw);

            if (!isDate(data.date)) {
                this.error(`${id}: falta "date" (YYYY-MM-DD)`);
            }
            if (data.updated !== undefined && !isDate(data.updated)) {
                this.error(`${id}: "updated" tiene que ser YYYY-MM-DD`);
            }

            const html = await render(body, await highlighter);
            const post = {
                date: data.date,
                updated: data.updated,
                size: Buffer.byteLength(raw),
                html,
            };
            return {
                code: `export default ${JSON.stringify(post)};`,
                map: null,
            };
        },
    };
}

const THEME = "light-plus";

async function render(body: string, highlighter: Highlighter): Promise<string> {
    const md = new Marked({ gfm: true });

    // los lenguajes de Shiki se cargan a demanda, antes de renderizar (que es sincrónico)
    const langs = new Set<string>();
    md.walkTokens(md.lexer(body), (token) => {
        if (token.type === "code" && token.lang) langs.add(token.lang);
    });
    for (const lang of langs) {
        if (highlighter.getLoadedLanguages().includes(lang)) continue;
        await highlighter.loadLanguage(lang as never).catch(() => {
            // lenguaje desconocido: queda como texto plano
        });
    }

    md.use({
        renderer: {
            code({ text, lang }: Tokens.Code) {
                const loaded =
                    lang && highlighter.getLoadedLanguages().includes(lang);
                return highlighter.codeToHtml(text, {
                    lang: loaded ? lang : "text",
                    theme: THEME,
                });
            },
            // links a otros sitios: siempre en una tab nueva (como ExternalLink)
            link({ href, title, tokens }: Tokens.Link) {
                const text = this.parser.parseInline(tokens);
                const external = /^https?:\/\//.test(href);
                const attrs = [
                    `href="${escapeAttr(href)}"`,
                    title ? `title="${escapeAttr(title)}"` : "",
                    external ? 'target="_blank" rel="noopener noreferrer"' : "",
                ].filter(Boolean);
                return `<a ${attrs.join(" ")}>${text}</a>`;
            },
        },
    });

    return md.parse(body, { async: false });
}

function isDate(value: string | undefined): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");
}

function escapeAttr(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** frontmatter simple: líneas "clave: valor" entre dos "---" */
function frontmatter(raw: string): {
    data: Record<string, string | undefined>;
    body: string;
} {
    const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
    if (!match) return { data: {}, body: raw };

    const data: Record<string, string> = {};
    for (const line of match[1]!.split("\n")) {
        const i = line.indexOf(":");
        if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return { data, body: raw.slice(match[0].length) };
}
