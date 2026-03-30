/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function esc(s: string | undefined): string {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function ragStr(r: string): string {
  switch (r) {
    case 'g': return 'On Track';
    case 'a': return 'At Risk';
    case 'r': return 'Off Track';
    default: return 'Not Started';
  }
}

export function ragCol(r: string): string {
  switch (r) {
    case 'g': return 'var(--rag-g)';
    case 'a': return 'var(--rag-a)';
    case 'r': return 'var(--rag-r)';
    default: return 'var(--border)';
  }
}
