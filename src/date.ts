/** "2026-11-06" → "November 6, 2026" (en UTC, para que server y cliente coincidan) */
export function formatDate(isoDate: string): string {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
        dateStyle: "long",
        timeZone: "UTC",
    });
}
