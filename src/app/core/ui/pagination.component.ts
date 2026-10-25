import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronLeft, ChevronRight } from './icons';

// "Showing 1–20 of 1,368" with page buttons; page is 0-based like Spring
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [DecimalPipe, LucideAngularModule],
  template: `
    @if (total() > 0) {
      <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row">
        <p>
          Showing <span class="font-medium text-slate-900">{{ from() | number }}</span>–<span class="font-medium text-slate-900">{{ to() | number }}</span>
          of <span class="font-medium text-slate-900">{{ total() | number }}</span>
        </p>
        @if (totalPages() > 1) {
          <nav class="flex items-center gap-1" aria-label="Pagination">
            <button type="button" class="btn-ghost btn-sm" [disabled]="page() === 0" (click)="pageChange.emit(page() - 1)" aria-label="Previous page">
              <lucide-icon [img]="ChevronLeft" [size]="16" />
            </button>
            @for (p of pages(); track $index) {
              @if (p === -1) {
                <span class="px-1 text-slate-400">…</span>
              } @else {
                <button type="button" class="min-w-8 rounded-md px-2 py-1 text-sm font-medium transition"
                        [class]="p === page() ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
                        (click)="pageChange.emit(p)">{{ p + 1 }}</button>
              }
            }
            <button type="button" class="btn-ghost btn-sm" [disabled]="page() >= totalPages() - 1" (click)="pageChange.emit(page() + 1)" aria-label="Next page">
              <lucide-icon [img]="ChevronRight" [size]="16" />
            </button>
          </nav>
        }
      </div>
    }
  `,
})
export class PaginationComponent {
  page = input.required<number>();
  size = input.required<number>();
  total = input.required<number>();
  pageChange = output<number>();

  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;

  totalPages = computed(() => Math.ceil(this.total() / this.size()));
  from = computed(() => this.page() * this.size() + 1);
  to = computed(() => Math.min(this.total(), (this.page() + 1) * this.size()));

  // First, last and the pages around the current one; -1 marks a gap
  pages = computed(() => {
    const last = this.totalPages() - 1;
    const current = this.page();
    const result: number[] = [];
    for (let p = 0; p <= last; p++) {
      if (p === 0 || p === last || Math.abs(p - current) <= 1) {
        result.push(p);
      } else if (result[result.length - 1] !== -1) {
        result.push(-1);
      }
    }
    return result;
  });
}
