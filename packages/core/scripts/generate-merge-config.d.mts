export const OUT: string;
export function collectCandidates(dir?: string): string[];
export function recognizedBases(candidates?: string[]): string[];
export function buildConfigSource(candidates?: string[]): { used: Set<string>; keep: string[]; source: string };
