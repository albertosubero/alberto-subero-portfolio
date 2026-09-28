import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of } from 'rxjs';
import { WikiSearchService } from '../api/wiki-search.service';
import { Suggestion, IDLE, LOADING, MIN_QUERY_LENGTH, SearchState, failed, loaded } from '../api/suggestion.model';
import { ComboboxComponent } from '../ui/combobox/combobox.component';

@Component({
  selector: 'app-resource-search',
  standalone: true,
  imports: [ComboboxComponent],
  template: `
    <app-combobox
      label="Búsqueda con Signals + rxResource"
      [state]="state()"
      (queryChange)="term.set($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceSearchComponent {
  private readonly api = inject(WikiSearchService);

  // #region demo
  protected readonly term = signal('');

  // Angular 22 trae debounced(), pero sigue marcado @experimental: para algo
  // que va a producción prefiero el interop estable, que hace lo mismo.
  private readonly debouncedTerm = toSignal(
    toObservable(this.term).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' }
  );

  // rxResource cancela solo el stream anterior cuando params cambia:
  // el switchMap deja de ser algo que tengas que recordar escribir.
  private readonly suggestions = rxResource({
    params: () => this.debouncedTerm().trim(),
    stream: ({ params }) =>
      params.length < MIN_QUERY_LENGTH ? of<Suggestion[]>([]) : this.api.search(params),
    defaultValue: [] as Suggestion[]
  });

  /** Traducimos el estado del resource al mismo SearchState que usan los otros dos. */
  protected readonly state = computed<SearchState>(() => {
    if (this.suggestions.isLoading()) return LOADING;

    const error = this.suggestions.error();
    if (error) return failed(error.message);

    if (this.debouncedTerm().trim().length < MIN_QUERY_LENGTH) return IDLE;
    return loaded(this.suggestions.value());
  });
  // #endregion
}
