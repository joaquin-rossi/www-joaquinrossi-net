export function stripIndent(string: string): string {
    const match = string.match(/^[ \t]*(?=\S)/gm);

    if (!match) {
        return string;
    }

    let minIndent = Number.POSITIVE_INFINITY;
    for (const indent of match) {
        minIndent = Math.min(minIndent, indent.length);
    }

    if (minIndent === 0 || minIndent === Number.POSITIVE_INFINITY) {
        return string;
    }

    return string.replace(new RegExp(`^[ \\t]{${minIndent}}`, "gm"), "");
}

export function leftPadList(lines: string[]): string[] {
    if (lines.length === 0) return [];

    const maxLen = Math.max(...lines.map(l => l.length));
    return lines.map(l => l.padStart(maxLen, " "));
}

export function rightPadList(lines: string[]): string[] {
    if (lines.length === 0) return [];

    const maxLen = Math.max(...lines.map(l => l.length));
    return lines.map(l => l.padEnd(maxLen, " "));
}

export function requireNonNull<T>(obj: T | null | undefined, msg: string | undefined = undefined): NonNullable<T> {
    if (obj == null) throw new Error(msg);
    return obj;
}

export function download(filename: string, data: any) {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}
