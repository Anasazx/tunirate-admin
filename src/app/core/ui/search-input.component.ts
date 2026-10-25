import { Component, OnDestroy, OnInit, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { Search, X } from './icons';

// Search box that emits (search) 300ms after the user stops typing
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="relative">
      <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"><lucide-icon [img]="Search" [size]="16" /></span>
      <input type="search" class="input pl-9 pr-8" [placeholder]="placeholder()" [ngModel]="value()" (ngModelChange)="onType($event)" />
      @if (value()) {
        <button type="button" class="absolute inset-y-0 right-2 my-auto flex h-6 items-center rounded px-0.5 text-slate-400 hover:text-slate-600" (click)="onType('')" aria-label="Clear search">
          <lucide-icon [img]="X" [size]="14" />
        </button>
      }
    </div>
  `,
  styles: [`input[type=search]::-webkit-search-cancel-button { display: none; }`],
})
export class SearchInputComponent implements OnInit, OnDestroy {
  placeholder = input('Search…');
  value = model('');
  search = output<string>();

  protected readonly Search = Search;
  protected readonly X = X;
  private typed$ = new Subject<string>();
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.typed$.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(v => this.search.emit(v.trim()));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onType(v: string) {
    this.value.set(v);
    this.typed$.next(v);
  }
}
