import { Link, createFileRoute } from "@tanstack/react-router";
import { LargeFolderIcon } from "../../components/icons";

const items = [{ to: "/blog", label: "Blog" }] as const;

export const Route = createFileRoute("/_explorer/")({
    component: Home,
});

function Home() {
    return (
        <ul className="icons">
            {items.map((item) => (
                <li key={item.to}>
                    <Link to={item.to} className="icon">
                        <LargeFolderIcon />
                        <span className="icon-label">{item.label}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
