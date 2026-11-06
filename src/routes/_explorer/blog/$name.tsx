import { createFileRoute, notFound } from "@tanstack/react-router";
import { DetailsGroup } from "../../../components/DetailsGroup";
import { formatDate } from "../../../date";
import { POST_TYPE, findPost, formatSize } from "../../../posts";

export const Route = createFileRoute("/_explorer/blog/$name")({
    loader: ({ params }) => {
        const post = findPost(params.name);
        if (!post) throw notFound();
        return post;
    },
    head: () => ({ meta: [{ property: "og:type", content: "article" }] }),
    staticData: { sidebar: PostDetails },
    component: PostPage,
});

function PostDetails() {
    const post = Route.useLoaderData();
    return (
        <DetailsGroup
            name={post.name}
            type={POST_TYPE}
            created={post.date}
            modified={post.modified}
            size={formatSize(post.size)}
        />
    );
}

function PostPage() {
    const post = Route.useLoaderData();
    return (
        <article className="page post">
            <h1>{post.name}</h1>
            <p className="post-date">
                {formatDate(post.date)}
                {post.updated && <> · Updated {formatDate(post.updated)}</>}
            </p>
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
    );
}
