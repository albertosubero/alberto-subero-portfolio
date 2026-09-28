import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, debounceTime, filter, map, of, pipe, switchMap, tap } from 'rxjs';
import { WikiSearchService } from '../api/wiki-search.service';
import { IDLE, LOADING, MIN_QUERY_LENGTH, SearchState, failed, loaded } from '../api/suggestion.model';

// #region demo
export const WikiSearchStore = signalStore(
  withState<SearchState>(IDLE),

  withMethods((store, api = inject(WikiSearchService)) => ({
    /**
     * rxMethod acepta un pipe de RxJS y lo conecta a la vida del store:
     * se puede llamar con un valor, un observable o un signal, y se limpia
     * solo cuando el store muere.
     */
    search: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(term =>
          patchState(store, term.trim().length < MIN_QUERY_LENGTH ? IDLE : LOADING)
        ),
        filter(term => term.trim().length >= MIN_QUERY_LENGTH),
        switchMap(term =>
          api.search(term).pipe(
            map(loaded),
            catchError((error: Error) => of(failed(error.message)))
          )
        ),
        tap(state => patchState(store, state))
      )
    )
  }))
);
// #endregion
