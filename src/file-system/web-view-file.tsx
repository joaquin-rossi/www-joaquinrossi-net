import {ReactNode} from "react";
import {FileShowParams, ps1, SimpleFile, SimpleFileParams} from "@/src/file-system/file-system";

export class WebViewFile extends SimpleFile {
    constructor(params: SimpleFileParams, public href: string) {
        super(params);
    }

    override type(): string {
        return "-";
    }

    override show(params: FileShowParams): ReactNode {
        const parentPath = params.path.slice(0, -1);
        const name = params.path.at(-1);
        return <div>
            <pre>{ps1(parentPath)} ./{name} {"\n"}</pre>
            <iframe
                src={this.href}
                width="600"
                height="600"
                allowFullScreen
            ></iframe>
        </div>;
    }
}
