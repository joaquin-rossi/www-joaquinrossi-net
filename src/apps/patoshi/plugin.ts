import { definePlugin } from "nitro";
import { startMonitor, stopMonitor } from "./monitor";

// plugin de Nitro (registrado en vite.config.ts): el chequeo corre al arrancar el server
// y después cada 1 hora, dentro del mismo proceso
export default definePlugin((nitroApp) => {
    startMonitor();
    nitroApp.hooks.hook("close", stopMonitor);
});
