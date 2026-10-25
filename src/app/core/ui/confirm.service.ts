import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  // "danger" paints the confirm button red
  tone?: 'danger' | 'primary';
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

// Promise based confirmation dialog: if (await confirm.ask({...})) { ... }
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmRequest | null>(null);

  ask(options: ConfirmOptions): Promise<boolean> {
    this.current()?.resolve(false);
    return new Promise(resolve => this.current.set({ ...options, resolve }));
  }

  close(confirmed: boolean) {
    this.current()?.resolve(confirmed);
    this.current.set(null);
  }
}
