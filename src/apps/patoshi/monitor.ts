// el chequeo de patoshi.exe (solo server): consulta mempool.space y deja el resultado en memoria.
//
// cada wallet es un output P2PK, así que se consulta por scripthash (sha256 del script).
// POST /api/scripthashes/txs/summary acepta hasta 300 scripthashes y devuelve las transacciones
// confirmadas que los tocan, con el valor neto para el grupo: 21,953 wallets son 74 requests.
// una salida (valor negativo) después del último movimiento conocido es una wallet que bajó

import { createHash } from "node:crypto";
import csv from "./patoshi_pubkeys_COMPLETE.csv?raw";
import {
    newOutflows,
    patoshiState,
    type Outflow,
    type PatoshiCheck,
} from "./state";

const API = "https://mempool.space/api";
const HEADERS = {
    "user-agent": "patoshi.exe (+https://www.joaquinrossi.net/patoshi.exe)",
};

/** máximo que acepta mempool.space por request */
const BATCH_SIZE = 300;
/** pausa entre requests, para no cargarle la API: el chequeo entero tarda unos 3 minutos */
const PAUSE_MS = 2_000;
/** cada cuánto se repite el chequeo */
export const INTERVAL_MS = 15 * 60 * 1_000;
/** si una respuesta llega a este largo puede estar cortada (rest-default-max-address-summary-txs) */
const MAX_SUMMARY_TXS = 5_000;
const ATTEMPTS = 4;

type Wallet = { height: number; scripthash: string; sats: number };

/** las wallets del CSV: block_height,output_index,address,amount_btc,script_type */
const wallets: Wallet[] = csv
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
        const [height, , pubkey, amount] = line.split(",");
        // script P2PK: OP_PUSHBYTES_65 <pubkey sin comprimir> OP_CHECKSIG
        const script = Buffer.from(`41${pubkey}ac`, "hex");
        return {
            height: Number(height),
            scripthash: createHash("sha256").update(script).digest("hex"),
            sats: btcToSats(amount!),
        };
    });

/** "50.12" → 5012000000, sin pasar por float */
function btcToSats(btc: string): number {
    const [whole, fraction = ""] = btc.split(".");
    return Number(whole) * 1e8 + Number(fraction.padEnd(8, "0"));
}

/** lo que devuelve el summary por cada transacción */
type SummaryTx = {
    txid: string;
    height: number;
    time: number;
    value: number;
    tx_position: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** fetch con reintentos: ante errores de red, 429 o 5xx espera (Retry-After si viene) y prueba de nuevo */
async function request(path: string, init?: RequestInit): Promise<string> {
    for (let attempt = 1; ; attempt++) {
        const res = await fetch(API + path, {
            ...init,
            headers: { ...HEADERS, ...init?.headers },
            signal: AbortSignal.timeout(30_000),
        }).catch((error: unknown) => String(error));

        let problem: string;
        let wait = 10_000 * attempt;
        let retry = true;
        if (typeof res === "string") {
            problem = res;
        } else {
            if (res.ok) return await res.text();
            problem = `${res.status} ${(await res.text()).slice(0, 200)}`;
            retry = res.status === 429 || res.status >= 500;
            const retryAfter = Number(res.headers.get("retry-after"));
            if (retryAfter > 0) wait = retryAfter * 1_000;
        }
        if (!retry || attempt === ATTEMPTS) {
            throw new Error(`mempool.space ${path}: ${problem}`);
        }
        await sleep(wait);
    }
}

async function check(): Promise<PatoshiCheck> {
    const state = patoshiState();
    const startedAt = Date.now();
    const batches = Math.ceil(wallets.length / BATCH_SIZE);
    const progress = { startedAt, batchesDone: 0, batches };
    state.running = progress;

    const tipHeight = Number(await request("/blocks/tip/height"));

    // una transacción puede tocar wallets de varios lotes: se suma su neto por txid
    const txs = new Map<string, SummaryTx>();
    for (let i = 0; i < batches; i++) {
        await sleep(PAUSE_MS);
        const batch = wallets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const body = await request("/scripthashes/txs/summary", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(batch.map((wallet) => wallet.scripthash)),
        });
        const summary = JSON.parse(body) as SummaryTx[];
        if (summary.length >= MAX_SUMMARY_TXS) {
            throw new Error(`batch ${i + 1} may be truncated`);
        }
        for (const tx of summary) {
            const seen = txs.get(tx.txid);
            if (seen) seen.value += tx.value;
            else txs.set(tx.txid, { ...tx });
        }
        progress.batchesDone = i + 1;
    }

    // los coinbase originales: cada bloque del CSV tiene que aparecer con lo que pagó
    const expected = new Map(wallets.map((w) => [w.height, w.sats]));
    let minedSats = 0;
    let inSats = 0;
    let outSats = 0;
    let coinbases = 0;
    const outflows: Outflow[] = [];
    for (const tx of txs.values()) {
        if (tx.tx_position === 0 && expected.get(tx.height) === tx.value) {
            coinbases++;
            minedSats += tx.value;
        } else if (tx.value > 0) {
            inSats += tx.value;
        } else if (tx.value < 0) {
            outSats -= tx.value;
            const { txid, height, time } = tx;
            outflows.push({ txid, height, time, sats: -tx.value });
        }
    }
    if (coinbases !== wallets.length) {
        throw new Error(
            `found ${coinbases} of ${wallets.length} coinbase outputs`,
        );
    }
    outflows.sort((a, b) => b.height - a.height);

    return {
        finishedAt: Date.now(),
        durationMs: Date.now() - startedAt,
        tipHeight,
        wallets: wallets.length,
        minedSats,
        outSats,
        inSats,
        balanceSats: minedSats - outSats + inSats,
        outflows,
    };
}

async function run() {
    const state = patoshiState();
    if (state.running) return; // el anterior todavía no terminó
    try {
        state.last = await check();
        state.error = null;
        const moved = newOutflows(state.last);
        console.log(
            `[patoshi] ${state.last.wallets} wallets at block ${state.last.tipHeight}: ` +
                `${state.last.balanceSats / 1e8} BTC, ${moved.length} new outflows ` +
                `(${Math.round(state.last.durationMs / 1000)}s)`,
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        state.error = { at: Date.now(), message };
        console.error(`[patoshi] check failed: ${message}`);
    } finally {
        state.running = null;
    }
}

const TIMER = Symbol.for("joaquinrossi.net/patoshi-timer");
type Global = typeof globalThis & {
    [TIMER]?: ReturnType<typeof setInterval>;
};

/** chequea ya y después cada 15 minutos */
export function startMonitor() {
    const global = globalThis as Global;
    clearInterval(global[TIMER]); // en dev el plugin se puede volver a cargar
    const state = patoshiState();
    const tick = () => {
        state.nextCheckAt = Date.now() + INTERVAL_MS;
        void run();
    };
    global[TIMER] = setInterval(tick, INTERVAL_MS);
    global[TIMER].unref();
    tick();
}

export function stopMonitor() {
    const global = globalThis as Global;
    clearInterval(global[TIMER]);
    global[TIMER] = undefined;
}
