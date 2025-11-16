"use client";

import {ReactNode, useEffect, useRef, useState} from "react";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import Terminal from "@/src/components/terminal";
import {download} from "@/src/util/util";
import {useRouter} from "next/navigation";

type Executable = (args: string[]) => Promise<void>;

export function TerminalFileComponent(): ReactNode {
    const router = useRouter();
    const ffmpegRef = useRef(new FFmpeg());
    const ffmpeg = ffmpegRef.current;

    const [lines, setLines] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    function pushLine(...newLines: string[]) {
        setLines(lines => [...lines, ...newLines]);
    }

    useEffect(() => {
        (async function () {
            const ffmpeg = ffmpegRef.current;
            ffmpeg.on("log", ({message}) => {
                if (message != "Aborted()") {
                    pushLine(message);
                }
            });
            await ffmpeg.load();
            setLoaded(true);
        })();
    }, []);

    const executablePath = new Map<string, Executable>([
        ["clear", async () => {
            setLines([]);
        }],
        ["exit", async () => {
            router.push("/");
        }],
        ["help", async () => {
            pushLine([...executablePath.keys()].toString());
        }],
        ["ffmpeg", async (args) => {
            await ffmpegRef.current.exec(args);
        }],
        ["ffmpeg-dl", async ([path]) => {
            const file = await ffmpeg.readFile(path) as Uint8Array;
            download(path, file.buffer);
        }]
    ]);

    return <div className={"flex-1 flex"}>
        {!loaded ? <p className={"font-mono"}>Loading...</p> :
            <Terminal
                lines={lines}
                commandAction={async cmd => {
                    pushLine("$ " + cmd);

                    const args = cmd.trim().split(/\s+/).filter(Boolean);
                    if (args.length <= 0) {
                        return;
                    }

                    const arg0 = args.shift()!;
                    const executable = executablePath.get(arg0);
                    if (executable == null) {
                        pushLine(`websh: ${arg0}: command not found`);
                        return;
                    }

                    await executable(args);
                }}
                filesAction={async files => {
                    for (const file of files) {
                        await ffmpeg.writeFile(
                            file.name,
                            new Uint8Array(await file.arrayBuffer())
                        );
                    }
                }}
            />
        }
    </div>;
}