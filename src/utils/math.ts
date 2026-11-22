export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)
