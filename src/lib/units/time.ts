import type { Branded } from "../brand";

export type Microseconds = Branded<number, "Microseconds">;
export type Milliseconds = Branded<number, "Milliseconds">;
export type Seconds = Branded<number, "Seconds">;
export type Minutes = Branded<number, "Minutes">;
export type Hours = Branded<number, "Hours">;

export const MILLISECONDS_PER_SECOND = 1000 as Milliseconds;
