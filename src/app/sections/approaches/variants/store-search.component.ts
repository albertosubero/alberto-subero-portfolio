import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SearchState } from '../api/suggestion.model';
import { ComboboxComponent } from '../ui/combobox/combobox.component';
import { WikiSearchStore } from './wiki-search.store';

@Component({
  selector: 'app-store-search',
  standalone: true,
  imports: [ComboboxComponent],
  // El store se provee a nivel de componente: vive y muere con la pestaña,
  // en vez de quedarse residente en el root injector.
  providers: [WikiSearchStore],
  template: `
    <app-combobox
      label="Búsqueda con NgRx SignalStore"
      [state]="state()"
      (queryChange)="store.search($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreSearchComponent {
  protected readonly store = inject(WikiSearchStore);

  protected readonly state = computed<SearchState>(() => ({
    status: this.store.status(),
    results: this.store.results(),
    error: this.store.error()
  }));
}
