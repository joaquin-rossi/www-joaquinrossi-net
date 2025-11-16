import {requireNonNull} from "@/src/util/util";
import {DirectoryFile} from "@/src/file-system/directory-file";
import {StaticRegularFile} from "@/src/file-system/static-regular-file";
import {File, FileCdParams, filePermsRead, Path, pathShow, ps1, SimpleFileParams} from "@/src/file-system/file-system";
import {PathLinkFile} from "@/src/file-system/path-link-file";
import {WebLinkFile} from "@/src/file-system/web-link-file";
import {TerminalFile} from "@/src/file-system/terminal/terminal-file";

const params: SimpleFileParams = {
    perms: filePermsRead("rw-r--r--"),
    links: 1,
    user: "www",
    group: "www",
    size: 1,
    date: new Date(),
};

const root: File = new DirectoryFile(
    params,
    [
        ["bin", new TerminalFile(params)],
        ["blog", new DirectoryFile(params, [])],
        ["complaints", new PathLinkFile(params, ["dev", "null"])],
        ["key.asc", new StaticRegularFile(params)],
        ["links", new DirectoryFile(params, [
            ["email", new WebLinkFile(params, "mailto:joaquin@joaquinrossi.net")],
            ["github", new WebLinkFile(params, "https://github.com/joaquin-rossi")],
        ])],
    ]
);

function cd(file: File, params: Omit<FileCdParams, "root">): ReturnType<File["cd"]> {
    return file.cd({...params, root});
}

export default async function Home(
    {params}: {
        params: Promise<{ slug: string[] }>,
    }
) {
    const path: Path = (await params).slug ?? [];
    const parentPath = path.slice(0, -1);
    const name = path.at(-1);

    try {
        const parentFile = requireNonNull(
            cd(root, {path: parentPath}),
            `File not found (path = ${pathShow(parentPath)})`
        );
        const file = requireNonNull(
            name == null ? parentFile : cd(parentFile, {path: [name]}),
            `File not found (path = ${pathShow(path)})`
        );

        return <div className="p-4 h-screen flex flex-col">
            {file.show({path, parent: parentFile})}
        </div>;
    } catch (e) {
        console.error(e);
        return <div className="p-4">
            <pre>
                {ps1(parentPath)} file {name} {"\n"}
                {name}: cannot open `{name}' (No such file or directory)
            </pre>
        </div>;
    }
}
