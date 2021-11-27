export async function sleep(ms: number, fn?: () => void): Promise<unknown> {
    return new Promise((res) => {
        setTimeout(() => { res(); if (fn) fn(); }, ms);
    })
}