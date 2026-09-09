import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDbm(val: number): string {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)} dBm`;
}

export function formatPercent(val: number): string {
  return `${Math.min(100, Math.max(0, val)).toFixed(1)}%`;
}

export function formatFrequency(hz: number): string {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(1)} kHz`;
  }
  return `${hz.toFixed(0)} Hz`;
}

export function formatTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}:${m}:${s}`;
}

export function getZoneFromCoordinates(x: number, z: number): 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3' {
  // Room coordinates: x is from -4.5 to +4.5 (cols 1, 2, 3), z is from -4.5 to +4.5 (rows A, B, C)
  let row: 'A' | 'B' | 'C' = 'B';
  if (z < -1.5) row = 'A';
  else if (z > 1.5) row = 'C';

  let col: '1' | '2' | '3' = '2';
  if (x < -1.5) col = '1';
  else if (x > 1.5) col = '3';

  return `${row}${col}` as any;
}
