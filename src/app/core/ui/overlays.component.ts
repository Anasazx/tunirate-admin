import { Component, HostListener, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from './icons';

// Renders toasts and the confirm dialog; placed once in the admin layout
@Component({
  selector: 'app-overlays',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 text-sm shadow-lg"
             [class.border-emerald-200]="t.kind === 'success'" [class.border-red-200]="t.kind === 'error'" [class.border-slate-200]="t.kind === 'info'">
          <lucide-icon [img]="t.kind === 'success' ? CircleCheck : t.kind === 'error' ? CircleX : Info" [size]="18"
                       [class]="t.kind === 'success' ? 'text-emerald-600' : t.kind === 'error' ? 'text-red-600' : 'text-brand-600'" />
          <p class="flex-1 text-slate-700">{{ t.message }}</p>
          <button type="button" class="text-slate-400 hover:text-slate-600" (click)="toasts.dismiss(t.id)" aria-label="Dismiss">
            <lucide-icon [img]="X" [size]="16" />
          </button>
        </div>
      }
    </div>

    @if (confirm.current(); as c) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" (click)="confirm.close(false)">
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="flex gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                 [class]="c.tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'">
              <lucide-icon [img]="c.tone === 'danger' ? TriangleAlert : Info" [size]="20" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">{{ c.title }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ c.message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="btn-secondary" (click)="confirm.close(false)">Cancel</button>
            <button type="button" [class]="c.tone === 'danger' ? 'btn-danger' : 'btn-primary'" (click)="confirm.close(true)">
              {{ c.confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class OverlaysComponent {
  toasts = inject(ToastService);
  confirm = inject(ConfirmService);

  protected readonly CircleCheck = CircleCheck;
  protected readonly CircleX = CircleX;
  protected readonly Info = Info;
  protected readonly TriangleAlert = TriangleAlert;
  protected readonly X = X;

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.confirm.current()) this.confirm.close(false);
  }
}
