import { Component, computed, input } from '@angular/core';
import { humanize } from './format';
import { Tone, toneOf } from './status';

const CLASSES: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

// Status pill: <app-badge [value]="product.status" />
@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset" [class]="classes()">
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>{{ label() || text() }}
  </span>`,
})
export class BadgeComponent {
  value = input<string | null | undefined>();
  label = input<string>();
  tone = input<Tone>();

  text = computed(() => humanize(this.value()));
  classes = computed(() => CLASSES[this.tone() ?? toneOf(this.value())]);
}
