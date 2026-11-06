// estado de patoshi.exe: vive solo en la memoria del proceso del server.
// lo escribe el monitor (plugin de Nitro) y lo lee la server function de la página;
// como pueden terminar en bundles distintos, se comparte por globalThis

/** una transacción que sacó plata de las wallets (neto, sumando todas las wallets que tocó) */
export type Outflow = {
    txid: string;
    height: number;
    /** unix, en segundos */
    time: number;
    /** satoshis que salieron (positivo) */
    sats: number;
};

export type PatoshiCheck = {
    /** unix, en milisegundos */
    finishedAt: number;
    durationMs: number;
    /** altura del último bloque al empezar el chequeo */
    tipHeight: number;
    wallets: number;
    /** lo que pagaron los coinbase originales */
    minedSats: number;
    /** lo que salió en transacciones posteriores */
    outSats: number;
    /** lo que entró después (casi todo polvo que le manda gente) */
    inSats: number;
    /** saldo actual confirmado: minado - salido + entrado */
    balanceSats: number;
    /** de la más nueva a la más vieja */
    outflows: Outflow[];
};

export type PatoshiStatus = {
    /** último chequeo completo */
    last: PatoshiCheck | null;
    /** chequeo en curso */
    running: { startedAt: number; batchesDone: number; batches: number } | null;
    /** último chequeo que falló (se borra cuando uno sale bien) */
    error: { at: number; message: string } | null;
    /** unix, en milisegundos */
    nextCheckAt: number | null;
};

/**
 * el último movimiento conocido de las wallets (diciembre de 2017). entre 2009 y 2017
 * se gastaron unos pocos coinbase; "intacto" quiere decir que no hubo salidas después de este bloque
 */
export const LAST_KNOWN_OUTFLOW = {
    height: 498_031,
    txid: "2efb698e61a9d9958b913d8e9c829874bfa8e67d25182f9c3580f5170e2463a7",
};

/** salidas posteriores al último movimiento conocido */
export function newOutflows(check: PatoshiCheck): Outflow[] {
    return check.outflows.filter(
        (outflow) => outflow.height > LAST_KNOWN_OUTFLOW.height,
    );
}

const KEY = Symbol.for("joaquinrossi.net/patoshi");

type Global = typeof globalThis & { [KEY]?: PatoshiStatus };

/** el estado compartido (se crea vacío la primera vez) */
export function patoshiState(): PatoshiStatus {
    const global = globalThis as Global;
    global[KEY] ??= {
        last: null,
        running: null,
        error: null,
        nextCheckAt: null,
    };
    return global[KEY];
}
