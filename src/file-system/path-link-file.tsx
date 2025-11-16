import {ReactNode} from "react";
import {redirect} from "next/navigation";
import {
    File,
    FileCdParams,
    FileShowEntry,
    FileShowEntryParams,
    FileShowParams,
    Path,
    pathShow,
    SimpleFile,
    SimpleFileParams
} from "@/src/file-system/file-system";

export class PathLinkFile extends SimpleFile {
    constructor(params: SimpleFileParams, public dest: Path) {
        super(params);
    }

    override type(): string {
        return "l";
    }

    override cd(params: FileCdParams): File | undefined {
        const {path, root} = params;
        if (path.length === 0) return this;

        return root
            .cd({...params, path: this.dest})
            ?.cd({...params, path});
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

