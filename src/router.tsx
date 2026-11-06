import { createRouter } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
    return createRouter({
        routeTree,
        scrollRestoration: true,
    });
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }

    interface StaticDataRouteOption {
        /** grupos extra para el panel lateral del marco (van debajo de los fijos) */
        sidebar?: ComponentType;
    }
}
