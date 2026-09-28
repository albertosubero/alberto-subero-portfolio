import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ComboboxComponent } from './combobox.component';
import { Suggestion, SearchState, IDLE, LOADING, failed, loaded } from '../../api/suggestion.model';

const SPAIN: Suggestion = { id: 'esp', title: 'España', url: 'https://es.wikipedia.org/wiki/Espana' };
const ARGENTINA: Suggestion = { id: 'arg', title: 'Argentina', url: 'https://es.wikipedia.org/wiki/Argentina' };
const URUGUAY: Suggestion = { id: 'ury', title: 'Uruguay', url: 'https://es.wikipedia.org/wiki/Uruguay' };

@Component({
  standalone: true,
  imports: [ComboboxComponent],
  template: `<app-combobox [state]="state()" (queryChange)="queries.push($event)" (picked)="pickedItems.push($event)" />`
})
class HostComponent {
  readonly state = signal<SearchState>(IDLE);
  readonly queries: string[] = [];
  readonly pickedItems: Suggestion[] = [];
}

describe('ComboboxComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[role="combobox"]');
  }

  function listbox(): HTMLElement {
    return fixture.nativeElement.querySelector('[role="listbox"]');
  }

  function optionEls(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
  }

  function type(value: string) {
    const field = input();
    field.value = value;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function press(key: string) {
    input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cablea el patrón ARIA de combobox', () => {
    const field = input();
    expect(field.getAttribute('aria-autocomplete')).toBe('list');
    expect(field.getAttribute('aria-controls')).toBe(listbox().id);
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector(`label[for="${field.id}"]`)).toBeTruthy();
  });

  it('abre el listbox solo cuando hay algo que mostrar', () => {
    expect(input().getAttribute('aria-expanded')).toBe('false');

    type('spa');
    host.state.set(loaded([SPAIN]));
    fixture.detectChanges();

    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(optionEls().length).toBe(1);
  });

  it('mueve el foco virtual con las flechas vía aria-activedescendant', () => {
    type('a');
    host.state.set(loaded([SPAIN, ARGENTINA, URUGUAY]));
    fixture.detectChanges();

    expect(input().getAttribute('aria-activedescendant')).toBeNull();

    press('ArrowDown');
    expect(input().getAttribute('aria-activedescendant')).toBe(optionEls()[0].id);
    expect(optionEls()[0].getAttribute('aria-selected')).toBe('true');

    press('ArrowDown');
    expect(input().getAttribute('aria-activedescendant')).toBe(optionEls()[1].id);

    // Y da la vuelta al llegar al final.
    press('ArrowDown');
    press('ArrowDown');
    expect(input().getAttribute('aria-activedescendant')).toBe(optionEls()[0].id);

    press('ArrowUp');
    expect(input().getAttribute('aria-activedescendant')).toBe(optionEls()[2].id);
  });

  it('salta al primero y al último con Home y End', () => {
    type('a');
    host.state.set(loaded([SPAIN, ARGENTINA, URUGUAY]));
    fixture.detectChanges();

    press('End');
    expect(input().getAttribute('aria-activedescendant')).toBe(optionEls()[2].id);

    press('Home');
    expect(input().getAttribute('aria-activedescendant')).toBe(optionEls()[0].id);
  });

  it('selecciona con Enter y emite el país elegido', () => {
    type('a');
    host.state.set(loaded([SPAIN, ARGENTINA]));
    fixture.detectChanges();

    press('ArrowDown');
    press('ArrowDown');
    press('Enter');

    expect(host.pickedItems).toEqual([ARGENTINA]);
    expect(input().value).toBe('Argentina');
  });

  it('limpia la búsqueda con Escape', () => {
    type('spa');
    host.state.set(loaded([SPAIN]));
    fixture.detectChanges();

    press('Escape');

    expect(input().value).toBe('');
    expect(host.queries.at(-1)).toBe('');
  });

  it('anuncia el estado a los lectores de pantalla', () => {
    const live = () => fixture.nativeElement.querySelector('[aria-live="polite"]').textContent.trim();

    type('spa');
    host.state.set(LOADING);
    fixture.detectChanges();
    expect(live()).toBe('Buscando…');

    host.state.set(loaded([SPAIN, ARGENTINA]));
    fixture.detectChanges();
    expect(live()).toBe('2 resultados disponibles');

    host.state.set(loaded([SPAIN]));
    fixture.detectChanges();
    expect(live()).toBe('1 resultado disponible');

    host.state.set(loaded([]));
    fixture.detectChanges();
    expect(live()).toBe('Sin resultados');

    host.state.set(failed('se cayó la API'));
    fixture.detectChanges();
    expect(live()).toBe('Error: se cayó la API');
  });

  it('no deja el listbox abierto con el campo vacío', () => {
    type('spa');
    host.state.set(loaded([SPAIN]));
    fixture.detectChanges();
    expect(input().getAttribute('aria-expanded')).toBe('true');

    type('');
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });
});
