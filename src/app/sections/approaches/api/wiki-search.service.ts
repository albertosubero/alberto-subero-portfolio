import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, defer, delay, finalize, map, of, tap, throwError } from 'rxjs';
import { OpenSearchResponse, Suggestion, parseOpenSearch } from './suggestion.model';
import { RequestMetricsService } from './request-metrics.service';

// OpenSearch de Wikipedia: pensada para autocompletado, sin clave, sin limite
// practico de peticiones y con Access-Control-Allow-Origin: * explicito.
const ENDPOINT = 'https://es.wikipedia.org/w/api.php';

@Injectable({ providedIn: 'root' })
export class WikiSearchService {
  private readonly http = inject(HttpClient);
  private readonly metrics = inject(RequestMetricsService);
  private readonly cache = new Map<string, Suggestion[]>();

  /**
   * Latencia simulada. Sin ella la API responde en ~80ms y la cancelacion en
   * vuelo es invisible: el contador de canceladas se queda a cero y se pierde
   * justo el argumento que esta seccion quiere ensenar.
   */
  readonly latency = signal(600);

  search(term: string): Observable<Suggestion[]> {
    // defer: nada ocurre hasta que alguien se suscribe, asi que el contador
    // mide suscripciones reales y no llamadas a la funcion.
    return defer(() => {
      const key = term.trim().toLowerCase();

      const cached = this.cache.get(key);
      if (cached) {
        this.metrics.markCacheHit();
        return of(cached);
      }

      this.metrics.markFired();
      let settled = false;

      return this.http.get<OpenSearchResponse>(ENDPOINT, {
        params: {
          action: 'opensearch',
          search: key,
          limit: 8,
          namespace: 0,
          format: 'json',
          origin: '*'
        }
      }).pipe(
        delay(this.latency()),
        map(parseOpenSearch),
        tap(list => this.cache.set(key, list)),
        tap({
          next: () => { settled = true; this.metrics.markSettled(); },
          error: () => { settled = true; this.metrics.markSettled(); }
        }),
        // El error de Angular ("Http failure response for ... 0 undefined") no
        // es algo que se pueda ensenar a un usuario.
        catchError((error: HttpErrorResponse) => throwError(() => new Error(this.describe(error)))),
        // finalize corre tambien al desuscribirse: si llegamos aqui sin haber
        // emitido ni fallado, es que alguien corto la peticion en vuelo.
        finalize(() => {
          if (!settled) this.metrics.markCancelled();
        })
      );
    });
  }

  private describe(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Sin conexión con Wikipedia';
    if (error.status === 429) return 'Demasiadas búsquedas seguidas, espera un momento';
    if (error.status >= 500) return 'Wikipedia devolvió un error, inténtalo de nuevo';
    return `No se pudo completar la búsqueda (${error.status})`;
  }

  clearCache() {
    this.cache.clear();
  }
}
