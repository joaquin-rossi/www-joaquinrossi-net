/** lo que plugins/markdown.ts genera para cada .md */
export type PostFile = {
    date: string; // YYYY-MM-DD, creación
    updated?: string; // YYYY-MM-DD, opcional
    size: number; // bytes del .md
    html: string;
};

export type Post = PostFile & {
    /** el nombre del archivo ("hello-world.md"): es el título y la URL */
    name: string;
    /** `updated` si está, si no `date` */
    modified: string;
};

/** el "Type" de los posts en el listado y en Details */
export const POST_TYPE = "Markdown Document";

// cada archivo de src/content/blog/ es un post
const files = import.meta.glob<PostFile>("./content/blog/*.md", {
    import: "default",
    eager: true,
});

export const posts: Post[] = Object.entries(files)
    .map(([path, file]) => ({
        ...file,
        name: path.split("/").pop()!,
        modified: file.updated ?? file.date,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

/** tamaño como lo mostraba XP: kilobytes redondeados para arriba ("1 KB") */
export function formatSize(bytes: number): string {
    return `${Math.ceil(bytes / 1024).toLocaleString("en-US")} KB`;
}

export function findPost(name: string): Post | undefined {
    return posts.find((post) => post.name === name);
}
