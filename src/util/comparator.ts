export type Comparator<T> = (a: T, b: T) => number;

export const compareNumbers: Comparator<number> = (a, b) => a - b;
export const compareStrings: Comparator<string> = (a, b) => a.localeCompare(b);
export const compareStringsCaseInsensitive: Comparator<string> = comparingBy(s => s.toLocaleLowerCase(), compareStrings);
export const compareBools: Comparator<boolean> = comparingBy(Number, compareNumbers);
export const compareDates: Comparator<Date> = comparingBy(d => d.getTime(), compareNumbers);
export const compareBigInts: Comparator<BigInt> = (a, b) => a > b ? 1 : a < b ? -1 : 0;

export function comparingBy<T, U>(f: (t: T) => U, c: Comparator<U>): Comparator<T> {
    return (a, b) => c(f(a), f(b));
}

export function comparingReversed<T>(c: Comparator<T>): Comparator<T> {
    return (a, b) => - c(a, b);
}

export function comparingNullsFirst<T>(c: Comparator<NonNullable<T>>): Comparator<T | null | undefined> {
    return (a, b) => {
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;
        return c(a, b);
    };
}

export function comparingNullsLast<T>(c: Comparator<NonNullable<T>>): Comparator<T | null | undefined> {
    return (a, b) => {
        if (a == null && b == null) return 0;
        if (a == null) return 1;
        if (b == null) return -1;
        return c(a, b);
    };
}

export function comparingCombine<T>(...cs: Comparator<T>[]): Comparator<T> {
    return (a, b) => {
        let r = 0;
        for (const c of cs) {
            r = c(a, b);
            if (r !== 0) return r;
        }
        return r;
    };
}

export function comparingWithList<T>(order: T[]): Comparator<T> {
    return comparingBy(t => order.indexOf(t), compareNumbers);
}

export function comparingWithListFirst<T>(order: T[], c: Comparator<T>): Comparator<T> {
    return (a, b) => {
        const aIdx = order.indexOf(a);
        const bIdx = order.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1 && bIdx === -1) return -1;
        if (aIdx === -1 && bIdx !== -1) return 1;
        return c(a, b);
    };
}

export function comparingWithListLast<T>(order: T[], c: Comparator<T>): Comparator<T> {
    return (a, b) => {
        const aIdx = order.indexOf(a);
        const bIdx = order.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1 && bIdx === -1) return 1;
        if (aIdx === -1 && bIdx !== -1) return -1;
        return c(a, b);
    };
}
