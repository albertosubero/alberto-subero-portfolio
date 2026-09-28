import { Injectable, computed, signal } from '@angular/core';

/**
 * Contadores compartidos por los tres enfoques. Solo hay una variante montada
 * a la vez (son pestanas), asi que un unico contador no es ambiguo: la pestana
 * lo resetea al cambiar.
 */
@Injectable({ providedIn: 'root' })
export class RequestMetricsService {
  private readonly _fired = signal(0);
  private readonly _cancelled = signal(0);
  private readonly _settled = signal(0);
  private readonly _cacheHits = signal(0);

  readonly fired = this._fired.asReadonly();
  readonly cancelled = this._cancelled.asReadonly();
  readonly settled = this._settled.asReadonly();
  readonly cacheHits = this._cacheHits.asReadonly();

  /** Lo interesante: cuanto trabajo se tiro a la basura. */
  readonly wastedRatio = computed(() => {
    const fired = this._fired();
    return fired === 0 ? 0 : Math.round((this._cancelled() / fired) * 100);
  });

  markFired() {
    this._fired.update(n => n + 1);
  }

  markCancelled() {
    this._cancelled.update(n => n + 1);
  }

  markSettled() {
    this._settled.update(n => n + 1);
  }

  markCacheHit() {
    this._cacheHits.update(n => n + 1);
  }

  reset() {
    this._fired.set(0);
    this._cancelled.set(0);
    this._settled.set(0);
    this._cacheHits.set(0);
  }
}
