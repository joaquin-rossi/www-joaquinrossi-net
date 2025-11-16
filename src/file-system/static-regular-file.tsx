import {ReactNode} from "react";
import {FileShowParams, SimpleFile, SimpleFileParams} from "@/src/file-system/file-system";

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

