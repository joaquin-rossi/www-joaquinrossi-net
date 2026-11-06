import {
    HeadContent,
    Link,
    Scripts,
    createRootRoute,
    useLocation,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Frame } from "../components/Frame";
import { drivePath } from "../path";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { name: "description", content: SITE_DESCRIPTION },
            { property: "og:site_name", content: SITE_NAME },
            { property: "og:type", content: "website" },
            { property: "og:description", content: SITE_DESCRIPTION },
            { name: "twitter:card", content: "summary" },
        ],
        links: [
            { rel: "icon", href: "/favicon.ico" },
            { rel: "stylesheet", href: appCss },
        ],
    }),
    shellComponent: RootDocument,
    notFoundComponent: () => (
        <Frame routeSidebars={false}>
            <NotFound />
        </Frame>
    ),
});

function RootDocument({ children }: { children: ReactNode }) {
    // el título es la ruta actual: "J:\", "J:\blog", ...
    const { pathname } = useLocation();
    const title = drivePath(pathname);
    const url = SITE_URL + pathname;

    return (
        <html lang="en">
            <head>
                <title>{title}</title>
                <meta property="og:title" content={title} />
                <meta property="og:url" content={url} />
                <link rel="canonical" href={url} />
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function NotFound() {
    return (
        <div className="page">
            <h1>The page cannot be found</h1>
            <p>
                The page you are looking for might have been removed or is
                temporarily unavailable.
            </p>
            <p>
                <Link to="/">Go back home</Link>
            </p>
        </div>
    );
}
