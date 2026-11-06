// íconos de Windows XP (ver vendor/windows-xp-icons/README.md);
// las versiones chicas en public/icons/ van al doble del tamaño en pantalla

export function FolderIcon() {
    return (
        <img src="/icons/folder-closed-32.png" width={16} height={16} alt="" />
    );
}

export function LargeFolderIcon() {
    return (
        <img src="/icons/folder-closed-96.png" width={48} height={48} alt="" />
    );
}

export function Chevron() {
    return (
        <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
            <path
                d="M1.5 4.5l3-3 3 3M1.5 8l3-3 3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );
}
