import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WikiSearchService } from './api/wiki-search.service';
import { RequestMetricsService } from './api/request-metrics.service';
import { APPROACH_NOTES, ApproachId } from './data/approach-notes';
import { SNIPPETS } from './data/snippets.generated';
import { ResourceSearchComponent } from './variants/resource-search.component';
import { RxjsSearchComponent } from './variants/rxjs-search.component';
import { StoreSearchComponent } from './variants/store-search.component';

@Component({
  selector: 'app-approaches',
  standalone: true,
  imports: [RxjsSearchComponent, ResourceSearchComponent, StoreSearchComponent],
  templateUrl: './approaches.section.html',
  styleUrl: './approaches.section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproachesSection {
  private readonly api = inject(WikiSearchService);
  protected readonly metrics = inject(RequestMetricsService);

  protected readonly notes = APPROACH_NOTES;
  protected readonly active = signal<ApproachId>('rxjs');
  protected readonly showCode = signal(false);

  protected readonly latency = this.api.latency;

  protected readonly note = computed(
    () => this.notes.find(n => n.id === this.active())!
  );

  protected readonly snippet = computed(() => SNIPPETS[this.active()]);

  /** Cambiar de pestaña destruye la variante anterior: los contadores empiezan de cero. */
  protected select(id: ApproachId) {
    if (id === this.active()) return;
    this.active.set(id);
    this.metrics.reset();
    this.api.clearCache();
  }

  protected onTabKeydown(event: KeyboardEvent, index: number) {
    const total = this.notes.length;
    let next: number | null = null;

    if (event.key === 'ArrowRight') next = (index + 1) % total;
    if (event.key === 'ArrowLeft') next = (index - 1 + total) % total;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = total - 1;
    if (next === null) return;

    event.preventDefault();
    this.select(this.notes[next].id);
    const tab = document.getElementById(`approach-tab-${this.notes[next].id}`);
    tab?.focus();
  }

  protected onLatencyChange(value: string) {
    this.latency.set(Number(value));
  }

  protected resetMetrics() {
    this.metrics.reset();
    this.api.clearCache();
  }
}
