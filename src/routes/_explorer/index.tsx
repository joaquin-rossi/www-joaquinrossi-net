import { Link, createFileRoute } from "@tanstack/react-router";
import { LargeIcon } from "../../components/icons";

const items = [
    { to: "/blog", label: "Blog", icon: "/icons/folder-closed-96.png" },
    {
        to: "/patoshi.exe",
        label: "patoshi.exe",
        icon: "/icons/magnifier-96.png",
    },
] as const;

export const Route = createFileRoute("/_explorer/")({
    component: Home,
});

function Home() {
    return (
        <ul className="icons">
            {items.map((item) => (
                <li key={item.to}>
                    <Link to={item.to} className="icon">
                        <LargeIcon src={item.icon} />
                        <span className="icon-label">{item.label}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
