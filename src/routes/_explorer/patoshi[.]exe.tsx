import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { getPatoshiStatus } from "../../apps/patoshi/server";
import {
    LAST_KNOWN_OUTFLOW,
    newOutflows,
    type PatoshiStatus,
} from "../../apps/patoshi/state";
import { DetailsGroup } from "../../components/DetailsGroup";
import { ExternalLink } from "../../components/ExternalLink";
import { formatDate } from "../../date";

const DESCRIPTION =
    "patoshi.exe keeps an eye on the bitcoins mined by Satoshi Nakamoto and checks that they have not moved.";

export const Route = createFileRoute("/_explorer/patoshi.exe")({
    loader: () => getPatoshiStatus(),
    head: () => ({
        meta: [
            { name: "description", content: DESCRIPTION },
            { property: "og:description", content: DESCRIPTION },
        ],
    }),
    staticData: { sidebar: PatoshiDetails },
    component: Patoshi,
});

type Verdict = "checking" | "failed" | "intact" | "moved";

function verdict(status: PatoshiStatus): Verdict {
    if (!status.last) return status.running ? "checking" : "failed";
    return newOutflows(status.last).length > 0 ? "moved" : "intact";
}

const VERDICT_LABEL: Record<Verdict, string> = {
    checking: "Checking",
    failed: "Unknown",
    intact: "Untouched",
    moved: "Moved",
};

/** 109614549037397 → "1,096,145.49037397 BTC" (sin pasar por float) */
function formatBtc(sats: number): string {
    const whole = Math.floor(sats / 1e8).toLocaleString("en-US");
    const fraction = String(sats % 1e8)
        .padStart(8, "0")
        .replace(/0+$/, "");
    return `${whole}${fraction && `.${fraction}`} BTC`;
}

/** unix en ms → "November 6, 2026, 05:30 UTC" (en UTC, igual en server y cliente) */
function formatTime(ms: number): string {
    const iso = new Date(ms).toISOString();
    return `${formatDate(iso.slice(0, 10))}, ${iso.slice(11, 16)} UTC`;
}

function formatDuration(ms: number): string {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
}

function shortTxid(txid: string): string {
    return `${txid.slice(0, 8)}…${txid.slice(-8)}`;
}

function PatoshiDetails() {
    const status = Route.useLoaderData();
    const extra = [`Status: ${VERDICT_LABEL[verdict(status)]}`];
    if (status.last) {
        extra.push(`Last check: ${formatTime(status.last.finishedAt)}`);
    }
    return (
        <DetailsGroup
            name="patoshi.exe"
            type="Application"
            created="2026-11-06"
            extra={extra}
        />
    );
}

/** mientras corre un chequeo refresca cada 5 s; si no, cuando le toca el próximo */
function useLiveStatus(status: PatoshiStatus) {
    const router = useRouter();
    useEffect(() => {
        const delay = status.running
            ? 5_000
            : status.nextCheckAt &&
              Math.max(status.nextCheckAt - Date.now() + 5_000, 5_000);
        if (!delay) return;
        const timer = setTimeout(() => router.invalidate(), delay);
        return () => clearTimeout(timer);
    }, [status, router]);
}

function Patoshi() {
    const status = Route.useLoaderData();
    useLiveStatus(status);
    const { last, running } = status;

    return (
        <div className="page patoshi">
            <header className="app-head">
                <img
                    src="/icons/magnifier-64.png"
                    width={32}
                    height={32}
                    alt=""
                />
                <div>
                    <h1>patoshi.exe</h1>
                    <p>
                        Keeps an eye on the bitcoins mined by Satoshi Nakamoto.
                    </p>
                </div>
            </header>

            <StatusBox status={status} />

            {last && (
                <div className="groupboxes">
                    <fieldset className="groupbox">
                        <legend>Balance</legend>
                        <dl className="props">
                            <Prop label="Wallets">
                                {last.wallets.toLocaleString("en-US")}
                            </Prop>
                            <Prop label="Mined">
                                {formatBtc(last.minedSats)}
                            </Prop>
                            <Prop label="Moved out">
                                {formatBtc(last.outSats)}
                            </Prop>
                            <Prop label="Received later">
                                {formatBtc(last.inSats)}
                            </Prop>
                            <Prop label="Balance">
                                <b>{formatBtc(last.balanceSats)}</b>
                            </Prop>
                        </dl>
                    </fieldset>
                    <fieldset className="groupbox">
                        <legend>Last check</legend>
                        <dl className="props">
                            <Prop label="Finished">
                                {formatTime(last.finishedAt)}
                            </Prop>
                            <Prop label="Block">
                                {last.tipHeight.toLocaleString("en-US")}
                            </Prop>
                            <Prop label="Took">
                                {formatDuration(last.durationMs)}
                            </Prop>
                            <Prop label="Next check">
                                {running
                                    ? `Running (${running.batchesDone} of ${running.batches})`
                                    : status.nextCheckAt &&
                                      formatTime(status.nextCheckAt)}
                            </Prop>
                        </dl>
                    </fieldset>
                </div>
            )}

            {last && status.error && (
                <p className="patoshi-note">
                    The check of {formatTime(status.error.at)} failed (
                    {status.error.message}). Showing the previous one.
                </p>
            )}

            {last && (
                <>
                    <h2>Movements</h2>
                    <table className="list">
                        <thead>
                            <tr>
                                <th>Transaction</th>
                                <th className="optional">Block</th>
                                <th>Date</th>
                                <th className="size">Moved out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {last.outflows.map((outflow) => (
                                <tr
                                    key={outflow.txid}
                                    className={
                                        outflow.height >
                                        LAST_KNOWN_OUTFLOW.height
                                            ? "new"
                                            : undefined
                                    }
                                >
                                    <td>
                                        <ExternalLink
                                            href={`https://mempool.space/tx/${outflow.txid}`}
                                            className="txid"
                                            title={outflow.txid}
                                        >
                                            {shortTxid(outflow.txid)}
                                        </ExternalLink>
                                    </td>
                                    <td className="optional muted">
                                        {outflow.height.toLocaleString("en-US")}
                                    </td>
                                    <td className="muted">
                                        {formatDate(
                                            new Date(outflow.time * 1000)
                                                .toISOString()
                                                .slice(0, 10),
                                        )}
                                    </td>
                                    <td className="size">
                                        {formatBtc(outflow.sats)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {last.outflows.length === 0 && (
                        <p className="empty">No movements.</p>
                    )}
                </>
            )}

            <h2>About</h2>
            <p>
                The “Patoshi pattern” is a pattern in the ExtraNonce field of
                the blocks mined in 2009 and 2010 that points to a single miner,
                widely believed to be Satoshi Nakamoto. This program watches the
                21,953 coinbase outputs attributed to it, from block 3 to block
                49,973, each one paying 50 BTC to its own public key.
            </p>
            <p>
                Every hour, it asks{" "}
                <ExternalLink href="https://mempool.space/">
                    mempool.space
                </ExternalLink>{" "}
                for the confirmed transactions of all of them and checks that
                nothing has left since the last known movement, in block{" "}
                {LAST_KNOWN_OUTFLOW.height.toLocaleString("en-US")} (December
                2017). A few of these coins were spent in the early days, most
                famously the 10 BTC Satoshi sent to Hal Finney in block 170.
            </p>
        </div>
    );
}

function Prop({ label, children }: { label: string; children: ReactNode }) {
    return (
        <>
            <dt>{label}:</dt>
            <dd>{children}</dd>
        </>
    );
}

function StatusBox({ status }: { status: PatoshiStatus }) {
    const { last, running } = status;
    const state = verdict(status);

    let icon: string;
    let title: string;
    let body: ReactNode;
    switch (state) {
        case "checking":
            icon = "/icons/information-64.png";
            title = "Checking the wallets…";
            body = (
                <>
                    <p>
                        This is the first check since the server started. It
                        takes a few minutes.
                    </p>
                    {running && (
                        <Progress
                            done={running.batchesDone}
                            total={running.batches}
                        />
                    )}
                </>
            );
            break;
        case "failed":
            icon = "/icons/security-alert-64.png";
            title = "The check could not be completed";
            body = (
                <p>
                    {status.error?.message ?? "It has not run yet."} It will try
                    again
                    {status.nextCheckAt
                        ? ` at ${formatTime(status.nextCheckAt)}`
                        : " soon"}
                    .
                </p>
            );
            break;
        case "moved": {
            const moved = newOutflows(last!);
            const sats = moved.reduce((total, o) => total + o.sats, 0);
            icon = "/icons/security-error-64.png";
            title = "Satoshi's coins have moved";
            body = (
                <p>
                    {moved.length === 1
                        ? "1 transaction"
                        : `${moved.length} transactions`}{" "}
                    took {formatBtc(sats)} out of the Patoshi wallets after
                    block {LAST_KNOWN_OUTFLOW.height.toLocaleString("en-US")}.
                    The newest one is in block{" "}
                    {moved[0]!.height.toLocaleString("en-US")}.
                </p>
            );
            break;
        }
        case "intact":
            icon = "/icons/security-ok-64.png";
            title = "Satoshi's coins have not moved";
            body = (
                <p>
                    None of the {last!.wallets.toLocaleString("en-US")} wallets
                    has lost any balance since December 2017, as of block{" "}
                    {last!.tipHeight.toLocaleString("en-US")}.
                </p>
            );
            break;
    }

    return (
        <section
            className={`status status--${state}`}
            role="status"
            aria-live="polite"
        >
            <img src={icon} width={32} height={32} alt="" />
            <div>
                <h2>{title}</h2>
                {body}
            </div>
        </section>
    );
}

/** barra de progreso de XP, con bloques verdes */
function Progress({ done, total }: { done: number; total: number }) {
    return (
        <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-label={`${done} of ${total} batches`}
        >
            <div style={{ width: `${(done / total) * 100}%` }} />
        </div>
    );
}
