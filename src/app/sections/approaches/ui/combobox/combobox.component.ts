import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { Suggestion, SearchState } from '../../api/suggestion.model';

let nextId = 0;

/**
 * Combobox accesible, puramente presentacional: no sabe de RxJS, de resource
 * ni de stores. Los tres enfoques montan ESTE mismo componente, de modo que lo
 * unico que cambia entre pestanas es la fontaneria reactiva que lo alimenta.
 *
 * Patron ARIA 1.2 "combobox with listbox popup".
 */
@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [],
  templateUrl: './combobox.component.html',
  styleUrl: './combobox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboboxComponent {
  readonly state = input.required<SearchState>();
  readonly label = input('Busca en Wikipedia');

  readonly queryChange = output<string>();
  readonly picked = output<Suggestion>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  private readonly uid = nextId++;
  protected readonly fieldId = `combobox-field-${this.uid}`;
  protected readonly listId = `combobox-list-${this.uid}`;

  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  protected readonly chosen = signal<Suggestion | null>(null);

  protected readonly results = computed(() => this.state().results);
  protected readonly isLoading = computed(() => this.state().status === 'loading');
  protected readonly error = computed(() => this.state().error);

  protected readonly expanded = computed(() =>
    this.query().length > 0 && (this.results().length > 0 || this.isLoading() || !!this.error())
  );

  protected readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    return index >= 0 && index < this.results().length ? this.optionId(index) : null;
  });

  /** Texto para el aria-live: lo que un lector de pantalla anuncia al cambiar. */
  protected readonly announcement = computed(() => {
    const state = this.state();
    if (state.status === 'loading') return 'Buscando…';
    if (state.status === 'error') return `Error: ${state.error}`;
    if (state.status !== 'loaded') return '';
    const total = state.results.length;
    if (total === 0) return 'Sin resultados';
    return `${total} ${total === 1 ? 'resultado disponible' : 'resultados disponibles'}`;
  });

  protected optionId(index: number) {
    return `${this.listId}-option-${index}`;
  }

  protected onInput(value: string) {
    this.query.set(value);
    this.activeIndex.set(-1);
    this.chosen.set(null);
    this.queryChange.emit(value);
  }

  protected onKeydown(event: KeyboardEvent) {
    const total = this.results().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (total) this.activeIndex.set((this.activeIndex() + 1) % total);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (total) this.activeIndex.set((this.activeIndex() - 1 + total) % total);
        break;
      case 'Home':
        if (total) { event.preventDefault(); this.activeIndex.set(0); }
        break;
      case 'End':
        if (total) { event.preventDefault(); this.activeIndex.set(total - 1); }
        break;
      case 'Enter': {
        const active = this.results()[this.activeIndex()];
        if (active) { event.preventDefault(); this.choose(active); }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.query.set('');
        this.activeIndex.set(-1);
        this.queryChange.emit('');
        this.field().nativeElement.value = '';
        break;
    }
  }

  protected choose(suggestion: Suggestion) {
    this.chosen.set(suggestion);
    this.query.set(suggestion.title);
    this.activeIndex.set(-1);
    this.field().nativeElement.value = suggestion.title;
    this.queryChange.emit('');
    this.picked.emit(suggestion);
  }
}
