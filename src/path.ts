/** la "unidad" en la que vive el sitio */
export const DRIVE = "J:\\";

/** "/blog/hola%20mundo" → ["blog", "hola mundo"] */
export function pathSegments(pathname: string): string[] {
    return pathname.split("/").filter(Boolean).map(decodeURIComponent);
}

/** "/blog/hola%20mundo" → "J:\blog\hola mundo" */
export function drivePath(pathname: string): string {
    return DRIVE + pathSegments(pathname).join("\\");
}
