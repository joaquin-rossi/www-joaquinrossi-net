import type { AnchorHTMLAttributes } from "react";

// links a otros sitios: siempre en una tab nueva
export function ExternalLink(
    props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">,
) {
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
}
