import {ReactNode} from "react";

export type Path = string[];

export function pathShow(path: Path): string {
    return `/${path.join("/")}`;
}

export type FileCdParams = {
    path: Path,
    root: File,
};

export type FileShowParams = {
    path: Path,
    parent: File,
};

export type FileShowEntryParams = {
    path: Path,
};

export type FileShowEntry = {
    label: string,
    href: string
};

export interface File {
    type(): string;

    perms(): FilePerms;

    links(): number;

    user(): string;

    group(): string;

    size(): number;

    date(): Date;

    cd(params: FileCdParams): File | undefined;

    show(params: FileShowParams): ReactNode;

    showEntry(params: FileShowEntryParams): FileShowEntry;
}

export type FilePerms = {
    user: FilePermTriad,
    group: FilePermTriad,
    other: FilePermTriad,
    setuid: boolean;
    setgid: boolean;
    sticky: boolean;
};

export type FilePermTriad = {
    read: boolean,
    write: boolean,
    execute: boolean,
}

type R = "r" | "-";
type W = "w" | "-";
type X = "x" | "s" | "S" | "-";
type T = "x" | "t" | "T" | "-";
export type FilePermString = `${R}${W}${X}${R}${W}${X}${R}${W}${T}`;

export function filePermsRead(txt: FilePermString): FilePerms {
    const validChars = /^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/;
    if (!validChars.test(txt)) {
        throw new Error(`Invalid permission string: ${txt}`);
    }

    function filePermTriad(r: string, w: string, x: string): FilePermTriad {
        return {
            read: r === "r",
            write: w === "w",
            execute: x === "x" || x === "s" || x === "S" || x === "t" || x === "T",
        };
    }

    return {
        user: filePermTriad(txt[0], txt[1], txt[2]),
        group: filePermTriad(txt[3], txt[4], txt[5]),
        other: filePermTriad(txt[6], txt[7], txt[8]),
        setuid: txt[2] === "s" || txt[2] === "S",
        setgid: txt[5] === "s" || txt[5] === "S",
        sticky: txt[8] === "t" || txt[8] === "T"
    };
}

export function filePermsShow(perms: FilePerms): FilePermString {
    type X<L extends string, U extends string> = "x" | "-" | L | U;

    function showTriad<L extends string, U extends string>(
        triad: FilePermTriad,
        special: boolean,
        specialCharLower: L,
        specialCharUpper: U,
    ): `${R}${W}${X<L, U>}` {
        const r = triad.read ? "r" : "-";
        const w = triad.write ? "w" : "-";

        let x: X<L, U>;
        if (special) {
            if (triad.execute) {
                x = specialCharLower;
            } else {
                x = specialCharUpper;
            }
        } else {
            x = triad.execute ? "x" : "-";
        }

        return `${r}${w}${x}`;
    }

    const user = showTriad(perms.user, perms.setuid, "s", "S");
    const group = showTriad(perms.group, perms.setgid, "s", "S");
    const other = showTriad(perms.other, perms.sticky, "t", "T");

    return `${user}${group}${other}`;
}

export type SimpleFileParams = {
    perms: FilePerms;
    links: number;
    user: string;
    group: string;
    size: number;
    date: Date;
};

export abstract class SimpleFile implements File {
    protected constructor(private params: SimpleFileParams) {
    }

    abstract type(): string;

    perms(): FilePerms {
        return this.params.perms;
    }

    links(): number {
        return this.params.links;
    }

    user(): string {
        return this.params.user;
    }

    group(): string {
        return this.params.group;
    }

    size(): number {
        return this.params.size;
    }

    date(): Date {
        return this.params.date;
    }

    cd(_params: FileCdParams): File | undefined {
        return this;
    }

    abstract show(params: FileShowParams): ReactNode;

    showEntry(params: FileShowEntryParams): FileShowEntry {
        return {
            label: params.path.at(-1)!,
            href: pathShow(params.path),
        };
    }
}

export abstract class SimpleDirectoryFile extends SimpleFile {
    protected constructor(params: SimpleFileParams) {
        super(params);
    }

    override type(): string {
        return "d";
    }

    override showEntry(params: FileShowEntryParams): FileShowEntry {
        return {
            label: params.path.at(-1) + "/",
            href: pathShow(params.path),
        };
    }
}

export function ps1(path: Path): ReactNode {
    return <span>
        <span className="text-green-400">
        www@joaquinrossi.net
    </span>
:
    <a href={pathShow(path)} className="underline text-blue-400">
        {pathShow(path)}
        </a>
        {""} $
    </span>;
}
