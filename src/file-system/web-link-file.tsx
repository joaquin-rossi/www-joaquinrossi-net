import {ReactNode} from "react";
import {redirect} from "next/navigation";
import {
    FileShowEntry,
    FileShowEntryParams,
    FileShowParams,
    SimpleFile,
    SimpleFileParams
} from "@/src/file-system/file-system";

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
