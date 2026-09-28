import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproachesSection } from './approaches.section';
import { RequestMetricsService } from './api/request-metrics.service';
import { APPROACH_NOTES } from './data/approach-notes';
import { SNIPPETS } from './data/snippets.generated';

describe('ApproachesSection', () => {
  let fixture: ComponentFixture<ApproachesSection>;
  let metrics: RequestMetricsService;

  function tabs(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
  }

  function activeTab(): HTMLElement {
    return tabs().find(t => t.getAttribute('aria-selected') === 'true')!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproachesSection],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    metrics = TestBed.inject(RequestMetricsService);
    metrics.reset();

    fixture = TestBed.createComponent(ApproachesSection);
    fixture.detectChanges();
  });

  it('cablea el patrón ARIA de tablist', () => {
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeTruthy();
    expect(tabs().length).toBe(APPROACH_NOTES.length);

    const panel: HTMLElement = fixture.nativeElement.querySelector('[role="tabpanel"]');
    expect(panel.getAttribute('aria-labelledby')).toBe(activeTab().id);
    expect(activeTab().getAttribute('aria-controls')).toBe(panel.id);
  });

  it('solo deja la pestaña activa en el orden de tabulación', () => {
    const tabbable = tabs().filter(t => t.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
    expect(tabbable[0]).toBe(activeTab());
  });

  it('cambia de enfoque al pulsar una pestaña', () => {
    expect(activeTab().textContent!.trim()).toBe(APPROACH_NOTES[0].tab);

    tabs()[2].click();
    fixture.detectChanges();

    expect(activeTab().textContent!.trim()).toBe(APPROACH_NOTES[2].tab);
    expect(fixture.nativeElement.querySelector('app-store-search')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-rxjs-search')).toBeNull();
  });

  it('recorre las pestañas con las flechas', () => {
    activeTab().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(activeTab().textContent!.trim()).toBe(APPROACH_NOTES[1].tab);

    activeTab().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(activeTab().textContent!.trim()).toBe(APPROACH_NOTES[0].tab);

    // Y da la vuelta hacia atrás.
    activeTab().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(activeTab().textContent!.trim()).toBe(APPROACH_NOTES.at(-1)!.tab);
  });

  it('reinicia los contadores al cambiar de enfoque', () => {
    metrics.markFired();
    metrics.markCancelled();
    expect(metrics.fired()).toBe(1);

    tabs()[1].click();
    fixture.detectChanges();

    expect(metrics.fired()).toBe(0);
    expect(metrics.cancelled()).toBe(0);
  });

  it('muestra el código del enfoque activo solo al pedirlo', () => {
    expect(fixture.nativeElement.querySelector('#approach-code')).toBeNull();

    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.approaches-code-toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    fixture.detectChanges();

    const figure: HTMLElement = fixture.nativeElement.querySelector('#approach-code');
    expect(figure).toBeTruthy();
    expect(figure.textContent).toContain(SNIPPETS['rxjs'].file);
    expect(fixture.nativeElement.querySelector('.approaches-code-toggle').getAttribute('aria-expanded')).toBe('true');
  });

  it('sirve el snippet que corresponde a la pestaña', () => {
    fixture.nativeElement.querySelector('.approaches-code-toggle').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#approach-code figcaption').textContent)
      .toContain('rxjs-search.component.ts');

    tabs()[2].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#approach-code figcaption').textContent)
      .toContain('wiki-search.store.ts');
  });

  it('los snippets salen del código fuente real, con marcas de resaltado', () => {
    for (const note of APPROACH_NOTES) {
      const snippet = SNIPPETS[note.id];
      expect(snippet).withContext(`falta el snippet de ${note.id}`).toBeTruthy();
      expect(snippet.code.length).toBeGreaterThan(80);
      expect(snippet.html).toContain('hljs-');
      expect(snippet.code).not.toContain('#region');
    }
  });
});
