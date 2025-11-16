import {FileShowParams, ps1, SimpleDirectoryFile, SimpleFileParams} from "@/src/file-system/file-system";
import {ReactNode} from "react";
import {TerminalFileComponent} from "@/src/file-system/terminal/terminal-file-component";

export class TerminalFile extends SimpleDirectoryFile {
    constructor(params: SimpleFileParams) {
        super(params);
    }

    override show(params: FileShowParams): ReactNode {
        const parentPath = params.path.slice(0, -1);
        const name = params.path.at(-1)!;
        return <>
            <pre>
            {ps1(parentPath)} cd {name} {"\n"}
            </pre>
            {this.render(params)}
        </>;
    }

    render(_params: FileShowParams): ReactNode {
        return <TerminalFileComponent/>;
    }
}
