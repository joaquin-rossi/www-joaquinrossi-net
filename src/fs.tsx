import {Fragment, ReactNode} from "react";
import {leftPadList} from "@/src/util/string-util";
import {compareStrings, comparingBy} from "@/src/util/comparator";
import {redirect} from "next/navigation";

export type Path = string[];

export function pathShow(path: Path): string {
    return `/${path.join("/")}`;
}

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

    cd(path: Path): File | undefined;

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

    cd(_path: Path): File | undefined {
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

export class StringRegularFile extends SimpleFile {
    constructor(params: SimpleFileParams, public content: string) {
        super(params);
    }

    override type(): string {
        return "-";
    }

    override show(params: FileShowParams): ReactNode {
        const parentPath = params.path.slice(0, -1);
        const name = params.path.at(-1);
        return <pre>
            {ps1(parentPath)} cat {name} {"\n"}
            {"\n"} {this.content}
        </pre>;
    }
}

export class StaticRegularFile extends SimpleFile {
    constructor(params: SimpleFileParams) {
        super(params);
    }

    override type(): string {
        return "-";
    }

    override show(_params: FileShowParams): ReactNode {
        throw new Error("Unreachable");
    }
}

export class DirectoryFile extends SimpleFile {
    public children: Map<string, File>;

    constructor(params: SimpleFileParams, children: [string, File][]) {
        super(params);
        this.children = new Map(children);
    }

    override type(): string {
        return "d";
    }

    override cd(path: Path): File | undefined {
        if (path.length === 0) return this;
        return this.children.get(path[0])?.cd(path.slice(1));
    }

    override show(params: FileShowParams): ReactNode {
        function showEntry(name: string, file: File) {
            const {label, href} = file.showEntry({path: [...params.path, name]});
            return {
                mode: file.type() + filePermsShow(file.perms()),
                link: String(file.links()),
                user: file.user(),
                group: file.group(),
                size: String(file.size()),
                date: file.date().toISOString().split("T")[0],
                name: <a href={href} className="underline">{label}</a>,
            } as const;
        }

        const children = [...this.children.entries()]
            .toSorted(comparingBy(([name]) => name, compareStrings));

        children.unshift(["..", params.parent]);
        children.unshift([".", this]);

        const lines = children.map(([name, file]) => showEntry(name, file));
        const lineModes = lines.map(x => x.mode);
        const lineLinks = leftPadList(lines.map(x => x.link));
        const lineUsers = leftPadList(lines.map(x => x.user));
        const lineGroups = leftPadList(lines.map(x => x.group));
        const lineSizes = leftPadList(lines.map(x => x.size));
        const lineDates = leftPadList(lines.map(x => x.date));
        const lineNames = lines.map(x => x.name);

        const parentPath = params.path.slice(0, -1);
        const name = params.path.at(-1);
        return <pre>
            {ps1(parentPath)} ls -al {name} {"\n"}
            total {this.children.size} {"\n"}
            {lines.map((_, i) =>
                <Fragment key={i}>
                    {lineModes[i]} {lineLinks[i]} {lineUsers[i]} {lineGroups[i]} {lineSizes[i]} {lineDates[i]} {lineNames[i]}
                    {"\n"}
                </Fragment>
            )}
        </pre>;
    }

    override showEntry(params: FileShowEntryParams): FileShowEntry {
        return {
            label: params.path.at(-1) + "/",
            href: pathShow(params.path),
        };
    }
}

export class PathLinkFile extends SimpleFile {
    constructor(params: SimpleFileParams, public dest: Path) {
        super(params);
    }

    override type(): string {
        return "l";
    }

    override cd(path: Path): File | undefined {
        if (path.length === 0) return this;
        return root.cd(this.dest)?.cd(path);
    }

    override show(_params: FileShowParams): ReactNode {
        return redirect(pathShow(this.dest));
    }

    override showEntry(params: FileShowEntryParams): FileShowEntry {
        return {
            label: params.path.at(-1) + " -> " + pathShow(this.dest),
            href: pathShow(this.dest),
        };
    }
}

export class WebLinkFile extends SimpleFile {
    constructor(params: SimpleFileParams, public href: string) {
        super(params);
    }

    override type(): string {
        return "l";
    }

    override show(_params: FileShowParams): ReactNode {
        return redirect(this.href);
    }

    override showEntry(params: FileShowEntryParams): FileShowEntry {
        return {
            label: params.path.at(-1) + " -> " + this.href,
            href: this.href,
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

export const params: SimpleFileParams = {
    perms: filePermsRead("rw-r--r--"),
    links: 1,
    user: "www",
    group: "www",
    size: 1,
    date: new Date(),
};

export const root: File = new DirectoryFile(
    params,
    [
        ["blog", new DirectoryFile(params, [])],
        ["complaints", new PathLinkFile(params, ["dev", "null"])],
        ["key.asc", new StaticRegularFile(params)],
        ["links", new DirectoryFile(params, [
            ["email", new WebLinkFile(params, "mailto:joaquin@joaquinrossi.net")],
            ["github", new WebLinkFile(params, "https://github.com/joaquin-rossi")],
        ])],
    ]
);