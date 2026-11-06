import type { ReactNode } from "react";
import { Chevron } from "./icons";

export function TaskGroup({
    title,
    primary = false,
    icon,
    children,
}: {
    title: string;
    primary?: boolean;
    /** ícono grande en la esquina del encabezado (64px, se muestra a 32) */
    icon?: string;
    children: ReactNode;
}) {
    const className = [
        "group",
        primary && "group--primary",
        icon && "group--with-icon",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <details className={className} open>
            <summary>
                {icon && (
                    <img
                        className="group-icon"
                        src={icon}
                        width={32}
                        height={32}
                        alt=""
                    />
                )}
                {title}
                <span className="chevron">
                    <Chevron />
                </span>
            </summary>
            <div className="group-body">{children}</div>
        </details>
    );
}

/** item de una lista de tareas, con su ícono de 16px (archivo de 32px) */
export function TaskItem({
    icon,
    children,
}: {
    icon: string;
    children: ReactNode;
}) {
    return (
        <li>
            <img src={icon} width={16} height={16} alt="" />
            {children}
        </li>
    );
}
