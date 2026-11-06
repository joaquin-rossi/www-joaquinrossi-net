import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Frame } from "../components/Frame";

// layout sin path: todo lo que esté en routes/_explorer/ queda dentro del marco
export const Route = createFileRoute("/_explorer")({
    component: () => (
        <Frame>
            <Outlet />
        </Frame>
    ),
});
