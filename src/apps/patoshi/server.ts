import { createServerFn } from "@tanstack/react-start";
import { patoshiState, type PatoshiStatus } from "./state";

/** el estado del monitor para la página (lo que haya en memoria, sin consultar nada) */
export const getPatoshiStatus = createServerFn({ method: "GET" }).handler(
    (): PatoshiStatus => structuredClone(patoshiState()),
);
