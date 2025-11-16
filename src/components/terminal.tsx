"use client";

import React, {useEffect, useRef, useState} from "react";

type TerminalProps = {
    lines: string[];
    commandAction?: (cmd: string) => void;
    filesAction?: (files: FileList) => void;
}

export default function Terminal(props: TerminalProps) {
    const [hover, setHover] = useState(false);
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        setHover(true);
    }

    function onDragLeave() {
        setHover(false);
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setHover(false);
        props.filesAction?.(e.dataTransfer.files);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            props.commandAction?.(value.trim());
            setValue("");
        }
    }

    useEffect(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, [props.lines]);

    return <div
        className={
            "flex-1 font-mono border-2 " +
            (hover ? "border-green-500" : "border-transparent")
        }
        onClick={() => textareaRef.current?.focus()}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
    >
        {props.lines.map((line, i) =>
            <div key={i}>{line}</div>
        )}

        <div className={"relative w-full"}>
            <span className="absolute left-0 top-0">$</span>
            <textarea
                autoFocus
                className="pl-[2ch] w-[90%] flex-1 outline-none resize-none"
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={textareaRef}
                value={value}
            />
        </div>
    </div>;
}
