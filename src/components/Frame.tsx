import { Link, useLocation, useMatches } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { DRIVE, pathSegments } from "../path";
import { ExternalLink } from "./ExternalLink";
import { TaskGroup, TaskItem } from "./TaskGroup";
import { FolderIcon } from "./icons";

export function Frame({
    children,
    routeSidebars = true,
}: {
    children: ReactNode;
    /** false en la página 404: las rutas que fallaron no tienen datos para sus grupos */
    routeSidebars?: boolean;
}) {
    // cada ruta activa puede sumar grupos al panel con staticData.sidebar
    const matches = useMatches();
    const sidebars = routeSidebars
        ? matches.flatMap((match) =>
              match.staticData.sidebar ? [match.staticData.sidebar] : [],
          )
        : [];

    // en celular el panel arranca cerrado y se cierra al navegar
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();
    useEffect(() => setMenuOpen(false), [pathname]);

    return (
        <div className="explorer" data-menu={menuOpen ? "open" : undefined}>
            <header className="bar">
                <Link to="/" className="brand">
                    joaquinrossi.net
                </Link>
                <button
                    type="button"
                    className="menu-toggle"
                    aria-expanded={menuOpen}
                    aria-controls="menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    Menu
                </button>
                <Address />
            </header>
            <div className="layout">
                <aside className="menu" id="menu">
                    <TaskGroup
                        title="Joaquín Rossi"
                        primary
                        icon="/icons/control-panel-64.png"
                    >
                        Software engineer
                    </TaskGroup>
                    <TaskGroup title="Other Places">
                        <ul>
                            <TaskItem icon="/icons/home-32.png">
                                <Link to="/">Home</Link>
                            </TaskItem>
                        </ul>
                    </TaskGroup>
                    <TaskGroup title="See Also">
                        <ul>
                            <TaskItem icon="/icons/email-32.png">
                                <a href="mailto:joaquin@joaquinrossi.net">
                                    Email
                                </a>
                            </TaskItem>
                            <TaskItem icon="/icons/internet-32.png">
                                <ExternalLink href="https://github.com/joaquin-rossi">
                                    GitHub
                                </ExternalLink>
                            </TaskItem>
                            <TaskItem icon="/icons/address-book-32.png">
                                <ExternalLink href="https://www.linkedin.com/in/joaquin-rossi-vieta/">
                                    LinkedIn
                                </ExternalLink>
                            </TaskItem>
                            <TaskItem icon="/icons/key-32.png">
                                <a
                                    href="/pgp.asc"
                                    title="0FFB BA96 13BE 1579 C451 41FA F9F0 34ED 3E57 56E4"
                                >
                                    PGP key
                                </a>
                            </TaskItem>
                        </ul>
                    </TaskGroup>
                    {sidebars.map((Sidebar, i) => (
                        <Sidebar key={i} />
                    ))}
                </aside>
                <main className="content">{children}</main>
            </div>
        </div>
    );
}

/** href de los primeros `count` segmentos: (["blog", "post"], 1) → "/blog" */
function segmentsHref(segments: string[], count: number): string {
    return "/" + segments.slice(0, count).map(encodeURIComponent).join("/");
}

function Address() {
    const { pathname } = useLocation();
    const segments = pathSegments(pathname);

    return (
        <nav className="address" aria-label="Breadcrumb">
            <span className="address-label">Address</span>
            <span className="address-field">
                <FolderIcon />
                <span className="crumbs">
                    <Crumb href="/" current={segments.length === 0}>
                        {DRIVE}
                    </Crumb>
                    {segments.map((segment, i) => {
                        const href = segmentsHref(segments, i + 1);
                        return (
                            <Fragment key={href}>
                                {i > 0 && <span className="sep">\</span>}
                                <Crumb
                                    href={href}
                                    current={i === segments.length - 1}
                                >
                                    {segment}
                                </Crumb>
                            </Fragment>
                        );
                    })}
                </span>
            </span>
            <UpButton segments={segments} />
        </nav>
    );
}

/** sube una carpeta; en la raíz queda deshabilitado, como en XP */
function UpButton({ segments }: { segments: string[] }) {
    const icon = <img src="/icons/up-32.png" width={16} height={16} alt="" />;

    if (segments.length === 0) {
        return (
            <span className="up-button" aria-disabled="true" title="Up">
                {icon}
            </span>
        );
    }

    return (
        <Link
            to={segmentsHref(segments, segments.length - 1) as "/"}
            activeOptions={{ exact: true }}
            className="up-button"
            title="Up"
            aria-label="Up one folder"
        >
            {icon}
        </Link>
    );
}

function Crumb({
    href,
    current,
    children,
}: {
    href: string;
    current: boolean;
    children: ReactNode;
}) {
    if (current) {
        return <span aria-current="page">{children}</span>;
    }
    // las rutas intermedias pueden no existir todavía, por eso el cast
    return (
        <Link to={href as "/"} activeOptions={{ exact: true }}>
            {children}
        </Link>
    );
}
