import { Link, createFileRoute } from "@tanstack/react-router";
import { DetailsGroup } from "../../../components/DetailsGroup";
import { POST_TYPE, formatSize, posts } from "../../../posts";

// datos de la carpeta a partir de sus posts (las fechas YYYY-MM-DD se comparan como texto):
// se creó con el post más viejo, se modificó con el último cambio, y pesa lo que suman
const dates = posts.map((post) => post.date).sort();
const modified = posts.map((post) => post.modified).sort();
const folder = {
    created: dates[0],
    modified: modified.at(-1),
    size: posts.reduce((total, post) => total + post.size, 0),
};

export const Route = createFileRoute("/_explorer/blog/")({
    head: () => ({
        meta: [
            { name: "description", content: "Joaquín Rossi's blog." },
            { property: "og:description", content: "Joaquín Rossi's blog." },
        ],
    }),
    staticData: { sidebar: BlogDetails },
    component: Blog,
});

function BlogDetails() {
    return (
        <DetailsGroup
            name="Blog"
            type="File Folder"
            created={folder.created}
            modified={folder.modified}
            size={formatSize(folder.size)}
        />
    );
}

function Blog() {
    return (
        <>
            <table className="list">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th className="size optional">Size</th>
                        <th className="optional">Type</th>
                        <th className="optional">Date Created</th>
                        <th>Date Modified</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.name}>
                            <td>
                                <Link
                                    to="/blog/$name"
                                    params={{ name: post.name }}
                                    className="file"
                                >
                                    <img
                                        src="/icons/text-document-32.png"
                                        width={16}
                                        height={16}
                                        alt=""
                                    />
                                    {post.name}
                                </Link>
                            </td>
                            <td className="size optional muted">
                                {formatSize(post.size)}
                            </td>
                            <td className="optional muted">{POST_TYPE}</td>
                            <td className="optional muted">{post.date}</td>
                            <td className="muted">{post.modified}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {posts.length === 0 && (
                <p className="empty">This folder is empty.</p>
            )}
        </>
    );
}
