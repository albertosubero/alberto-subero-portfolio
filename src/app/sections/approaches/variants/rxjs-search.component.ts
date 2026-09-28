import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { WikiSearchService } from '../api/wiki-search.service';
import { IDLE, LOADING, MIN_QUERY_LENGTH, failed, loaded } from '../api/suggestion.model';
import { ComboboxComponent } from '../ui/combobox/combobox.component';

@Component({
  selector: 'app-rxjs-search',
  standalone: true,
  imports: [ComboboxComponent],
  template: `
    <app-combobox
      label="Búsqueda con RxJS puro"
      [state]="state()"
      (queryChange)="term$.next($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RxjsSearchComponent {
  private readonly api = inject(WikiSearchService);

  // #region demo
  protected readonly term$ = new Subject<string>();

  private readonly state$ = this.term$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term =>
      term.trim().length < MIN_QUERY_LENGTH
        ? of(IDLE)
        : this.api.search(term).pipe(
            map(loaded),
            catchError((error: Error) => of(failed(error.message))),
            // startWith va DENTRO del switchMap: así cada término nuevo
            // reinicia el loading, en vez de pintarlo una sola vez al arrancar.
            startWith(LOADING)
          )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** toSignal se encarga de la suscripción y de limpiarla: ni un subscribe manual. */
  protected readonly state = toSignal(this.state$, { initialValue: IDLE });
  // #endregion
}
