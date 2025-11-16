import {Fragment, ReactNode} from "react";
import {compareStrings, comparingBy} from "@/src/util/comparator";
import {leftPadList} from "@/src/util/util";
import {
    File,
    FileCdParams,
    filePermsShow,
    FileShowEntry,
    FileShowEntryParams,
    FileShowParams,
    pathShow,
    ps1,
    SimpleDirectoryFile,
    SimpleFileParams
} from "@/src/file-system/file-system";

export class DirectoryFile extends SimpleDirectoryFile {
    public children: Map<string, File>;

    constructor(params: SimpleFileParams, children: [string, File][]) {
        super(params);
        this.children = new Map(children);
    }

    override cd(params: FileCdParams): File | undefined {
        const {path} = params;
        if (path.length === 0) return this;
        return this.children.get(path[0])?.cd({
            ...params,
            path: path.slice(1),
        });
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

