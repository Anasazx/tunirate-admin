import { Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { Inbox } from './icons';

// Friendly placeholder for empty lists; extra actions go in the content slot
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <lucide-icon [img]="icon() ?? Inbox" [size]="22" />
      </div>
      <h3 class="mt-4 text-sm font-semibold text-slate-900">{{ title() }}</h3>
      @if (message()) {
        <p class="mt-1 max-w-sm text-sm text-slate-500">{{ message() }}</p>
      }
      <div class="mt-4"><ng-content /></div>
    </div>
  `,
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input<string>();
  icon = input<LucideIconData>();
  protected readonly Inbox = Inbox;
}
