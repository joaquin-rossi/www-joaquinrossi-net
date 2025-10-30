import type {Metadata, Viewport} from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
    title: "Joaquín Rossi",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function RootLayout(
    {children}: Readonly<{ children: React.ReactNode }>,
) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}
