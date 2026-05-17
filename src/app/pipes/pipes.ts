import { Pipe, PipeTransform } from '@angular/core';

// ─── TimeAgo Pipe ─────────────────────────────────────────────────────────────
@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60)   return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400)return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}j`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}sem`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}

// ─── Truncate Pipe ────────────────────────────────────────────────────────────
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 280, trail: string = '…'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit).trimEnd() + trail;
  }
}

// ─── Format Count Pipe ────────────────────────────────────────────────────────
@Pipe({
  name: 'formatCount',
  standalone: true
})
export class FormatCountPipe implements PipeTransform {
  transform(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1).replace('.0', '') + 'K';
    return value.toString();
  }
}
