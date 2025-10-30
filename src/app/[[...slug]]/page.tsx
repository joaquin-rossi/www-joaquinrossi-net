import {Path, pathShow, ps1, root} from "@/src/fs";

export function requireNonNull<T>(obj: T | null | undefined, msg: string | undefined = undefined): NonNullable<T> {
    if (obj == null) throw new Error(msg);
    return obj;
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
            root.cd(parentPath),
            `File not found (path = ${pathShow(parentPath)})`
        );
        const file = requireNonNull(
            name == null ? parentFile : parentFile.cd([name]),
            `File not found (path = ${pathShow(path)})`
        );

        return <>
            <div className="p-4">
                {file.show({path, parent: parentFile})}
            </div>
        </>;
    } catch (e) {
        return <div className="p-4">
            <pre>
                {ps1(parentPath)} file {name} {"\n"}
                {name}: cannot open `{name}' (No such file or directory)
            </pre>
        </div>;
    }
}
