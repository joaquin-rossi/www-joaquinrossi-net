import {DirectoryFile} from "@/src/file-system/directory-file";
import {StaticRegularFile} from "@/src/file-system/static-regular-file";
import {File, FileCdParams, filePermsRead, Path, pathShow, ps1, SimpleFileParams} from "@/src/file-system/file-system";
import {PathLinkFile} from "@/src/file-system/path-link-file";
import {WebLinkFile} from "@/src/file-system/web-link-file";
import {WebViewFile} from "@/src/file-system/web-view-file";

const buildDate = new Date(process.env.NEXT_PUBLIC_BUILD_DATE as any);

const params: SimpleFileParams = {
    perms: filePermsRead("rw-r--r--"),
    links: 1,
    user: "www",
    group: "www",
    size: 1,
    date: buildDate,
};

const root: File = new DirectoryFile(
    params,
    [
        ["blog", new DirectoryFile(params, [])],
        ["complaints", new PathLinkFile(params, ["dev", "null"])],
        ["demo", function demoDir() {
            const demoExeParams = {
                ...params,
                perms: filePermsRead("rwxr-xr-x")
            };

            return new DirectoryFile(params, [
                ["dissolve", new WebViewFile(demoExeParams, "/godot-build/dissolve/dissolve.html")],
                ["dither-transparency", new WebViewFile(demoExeParams, "/godot-build/dither-transparency/dither-transparency.html")],
                ["fire-contour", new WebViewFile(demoExeParams, "/godot-build/fire-contour/fire-contour.html")],
                ["fire-shimmer", new WebViewFile(demoExeParams, "/godot-build/fire-shimmer/fire-shimmer.html")],
                ["magic-shield", new WebViewFile(demoExeParams, "/godot-build/magic-shield/magic-shield.html")],
                ["water", new WebViewFile(demoExeParams, "/godot-build/water/water.html")],
            ]);
        }()],
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

    const parentFile = cd(root, {path: parentPath});
    if (parentFile == null) {
        return <div className="p-4">
            <pre>
                {ps1([])} cd {pathShow(parentPath)} {"\n"}
                cd: {pathShow(parentPath)}: No such file or directory
            </pre>
        </div>;
    }

    const file = name == null ? parentFile : cd(parentFile, {path: [name]});
    if (file == null) {
        return <div className="p-4">
            <pre>
                {ps1(parentPath)} file {name} {"\n"}
                {name}: cannot open `{name}' (No such file or directory)
            </pre>
        </div>;
    }

    return <div className="p-4 h-screen flex flex-col">
        {file.show({path, parent: parentFile})}
    </div>;
}
