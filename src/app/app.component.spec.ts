import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { experiences } from './utils/jobs-experiences';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'alberto-subero-portfolio' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('alberto-subero-portfolio');
  });

  it('should render the presentation heading', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Alberto Subero');
  });

  it('should keep every experience in the DOM, collapsing the extra ones', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('.card-info');
    const collapsed = compiled.querySelectorAll('.card-info.is-collapsed');

    expect(cards.length).toBe(experiences.length);
    expect(collapsed.length).toBe(experiences.length - fixture.componentInstance.experiencesLimit);
  });

  it('should reveal every experience after asking for more', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('#experience .show-more button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const collapsed = fixture.nativeElement.querySelectorAll('.card-info.is-collapsed');
    expect(collapsed.length).toBe(0);
  });
});
