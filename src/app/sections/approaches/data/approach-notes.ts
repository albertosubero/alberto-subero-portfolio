export type ApproachId = 'rxjs' | 'resource' | 'store';

export interface ApproachNote {
  id: ApproachId;
  tab: string;
  headline: string;
  stack: string;
  yes: string[];
  no: string[];
}

export const APPROACH_NOTES: ApproachNote[] = [
  {
    id: 'rxjs',
    tab: 'RxJS puro',
    headline: 'El flujo es el estado',
    stack: 'debounceTime · distinctUntilChanged · switchMap · catchError · shareReplay · toSignal',
    yes: [
      'Cuando el problema ES un flujo: carreras entre peticiones, reintentos con backoff, combinar varias fuentes.',
      'Cuando necesito control fino del orden: switchMap, concatMap y exhaustMap resuelven problemas distintos y aquí se eligen a mano.',
      'En equipos que ya leen RxJS con soltura: es el código más denso, pero también el más explícito sobre qué cancela qué.'
    ],
    no: [
      'Para un estado plano de UI (un toggle, un tab activo) montar un pipeline es artillería de más.',
      'Con gente que aún no domina RxJS: un shareReplay mal puesto es una fuga de memoria que no da la cara hasta producción.'
    ]
  },
  {
    id: 'resource',
    tab: 'Signals + rxResource',
    headline: 'La cancelación deja de ser tu problema',
    stack: 'signal · toObservable · debounceTime · rxResource · computed',
    yes: [
      'Para el caso de siempre: un parámetro cambia y hay que recargar datos, con loading y error incluidos.',
      'Porque rxResource cancela solo el stream anterior cuando params cambia. El switchMap deja de ser algo que tengas que acordarte de escribir.',
      'Cuando quiero que el componente exponga signals y no observables: encaja con OnPush y con zoneless sin adaptadores.'
    ],
    no: [
      'Si la orquestación es de verdad compleja (combinar streams, reintentos condicionales), el resource se queda corto y toca bajar a RxJS.',
      'Ojo con la versión: rxResource solo es API pública desde Angular 22. En 19, 20 y 21 está marcado @experimental.'
    ]
  },
  {
    id: 'store',
    tab: 'NgRx SignalStore',
    headline: 'Cuando el estado sale del componente',
    stack: 'signalStore · withState · withMethods · rxMethod · patchState',
    yes: [
      'Cuando varias vistas comparten el mismo estado y no quiero pasarlo por inputs a través de media aplicación.',
      'rxMethod da el pipeline de RxJS con la limpieza atada al ciclo de vida del store, y se invoca con un valor, un observable o un signal.',
      'Cuando el estado merece nombre propio y tests aparte del componente que lo pinta.'
    ],
    no: [
      'Para un buscador que vive en una sola pantalla es sobreingeniería: una dependencia más y un fichero más para lo mismo.',
      'Si no vas a compartir ni a testear el estado por separado, el SignalStore solo añade ceremonia.'
    ]
  }
];
