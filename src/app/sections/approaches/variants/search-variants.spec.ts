import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { WikiSearchService } from '../api/wiki-search.service';
import { RequestMetricsService } from '../api/request-metrics.service';
import { OpenSearchResponse } from '../api/suggestion.model';
import { ResourceSearchComponent } from './resource-search.component';
import { RxjsSearchComponent } from './rxjs-search.component';
import { StoreSearchComponent } from './store-search.component';

const ENDPOINT = 'https://es.wikipedia.org/w/api.php';
const DEBOUNCE = 300;

/** OpenSearch responde con una tupla posicional, no con objetos. */
function openSearchPayload(term: string, ...titles: string[]): OpenSearchResponse {
  return [
    term,
    titles,
    titles.map(() => ''),
    titles.map(title => `https://es.wikipedia.org/wiki/${encodeURIComponent(title)}`)
  ];
}

/**
 * La misma bateria corre contra los tres enfoques. Si los tres la pasan, la
 * comparacion de la seccion es honesta: cambia la fontaneria reactiva, no el
 * comportamiento observable.
 *
 * Con temporizadores reales en vez de fakeAsync a proposito: rxResource dispara
 * su carga desde effects, y forzar su vaciado a mano dentro de fakeAsync choca
 * con el ApplicationRef.tick que ya programa el zone (NG0101). Esperando de
 * verdad, cada await cede el control al zone, que tickea y vacia los effects
 * por su cuenta. De paso el debounce se prueba con el reloj real.
 */
const VARIANTS: Array<[string, Type<unknown>]> = [
  ['RxJS puro', RxjsSearchComponent],
  ['Signals + rxResource', ResourceSearchComponent],
  ['NgRx SignalStore', StoreSearchComponent]
];

for (const [name, Variant] of VARIANTS) {
  describe(`Buscador — ${name}`, () => {
    let fixture: ComponentFixture<unknown>;
    let http: HttpTestingController;
    let metrics: RequestMetricsService;

    /** Cede el control al zone y pinta. */
    async function settle(ms = 0) {
      await new Promise(resolve => setTimeout(resolve, ms));
      fixture.detectChanges();
    }

    /** Escribe en el combobox como lo haria una persona. */
    async function type(value: string) {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[role="combobox"]');
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await settle();
    }

    function options(): string[] {
      return Array.from(fixture.nativeElement.querySelectorAll('[role="option"] .combobox-name'))
        .map(el => (el as HTMLElement).textContent!.trim());
    }

    function pending() {
      return http.match(req => req.url.startsWith(ENDPOINT));
    }

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Variant],
        providers: [provideHttpClient(), provideHttpClientTesting()]
      }).compileComponents();

      http = TestBed.inject(HttpTestingController);
      metrics = TestBed.inject(RequestMetricsService);
      metrics.reset();

      const api = TestBed.inject(WikiSearchService);
      api.latency.set(0); // sin latencia simulada los tests no esperan de mas
      api.clearCache();

      fixture = TestBed.createComponent(Variant);
      fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('no pide nada antes de que venza el debounce', async () => {
      await type('spain');
      await settle(DEBOUNCE - 100);
      expect(pending().length).toBe(0);

      await settle(150);
      const requests = pending();
      expect(requests.length).toBe(1);

      requests[0].flush(openSearchPayload('spa', 'Spain'));
      await settle();
    });

    it('ignora términos por debajo del mínimo', async () => {
      await type('s');
      await settle(DEBOUNCE + 50);

      expect(pending().length).toBe(0);
      expect(metrics.fired()).toBe(0);
    });

    it('pinta los resultados cuando llegan', async () => {
      await type('spa');
      await settle(DEBOUNCE + 50);
      pending()[0].flush(openSearchPayload('spa', 'Spain'));
      await settle();

      expect(options()).toEqual(['Spain']);
    });

    it('cancela la petición en vuelo al cambiar el término', async () => {
      await type('spa');
      await settle(DEBOUNCE + 50);
      const first = pending()[0];

      // Nuevo término mientras la anterior sigue en el aire.
      await type('arg');
      await settle(DEBOUNCE + 50);

      expect(first.cancelled).toBeTrue();
      expect(metrics.cancelled()).toBe(1);

      pending()[0].flush(openSearchPayload('arg', 'Argentina'));
      await settle();

      expect(options()).toEqual(['Argentina']);
      expect(metrics.fired()).toBe(2);
    });

    it('no repite la petición si el término no cambia', async () => {
      await type('spa');
      await settle(DEBOUNCE + 50);
      pending()[0].flush(openSearchPayload('spa', 'Spain'));
      await settle();

      await type('spa');
      await settle(DEBOUNCE + 50);

      expect(pending().length).toBe(0);
      expect(metrics.fired()).toBe(1);
    });

    it('muestra el error sin romper el flujo', async () => {
      await type('zzz');
      await settle(DEBOUNCE + 50);
      pending()[0].flush('boom', { status: 500, statusText: 'Server Error' });
      await settle();

      expect(fixture.nativeElement.querySelector('.combobox-error')).toBeTruthy();

      // Y sigue vivo: una búsqueda posterior funciona.
      await type('spa');
      await settle(DEBOUNCE + 50);
      pending()[0].flush(openSearchPayload('spa', 'Spain'));
      await settle();

      expect(options()).toEqual(['Spain']);
    });
  });
}
