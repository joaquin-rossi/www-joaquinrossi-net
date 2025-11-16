import {ReactNode} from "react";
import {FileShowParams, ps1, SimpleFile, SimpleFileParams} from "@/src/file-system/file-system";

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
            {this.content}
        </pre>;
    }
}

