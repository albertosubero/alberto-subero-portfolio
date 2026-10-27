// Acto 2: el mismo componente (pintar el perfil) escrito en tres épocas del frontend.

export type EraId = 'jquery' | 'angularjs' | 'angular'

export type Era = {
  id: EraId
  name: string
  since: string
  file: string
  code: string
}

export const ERAS: Era[] = [
  {
    id: 'jquery',
    name: 'jQuery',
    since: '2006',
    file: 'cv.js',
    code: `// cv.js
$(document).ready(function () {
  $.ajax({
    url: '/api/perfil.php',
    success: function (data) {
      var html = '';
      for (var i = 0; i < data.skills.length; i++) {
        html += '<li>' + data.skills[i] + '</li>';
      }
      $('#skills').html(html);
      $('#nombre').text(data.nombre).fadeIn(400);
    }
  });
});`,
  },
  {
    id: 'angularjs',
    name: 'AngularJS',
    since: '2010',
    file: 'perfil.controller.js',
    code: `// perfil.controller.js
angular.module('cv', [])
  .controller('PerfilCtrl', function ($scope, $http) {
    $scope.skills = [];
    $http.get('/api/perfil').then(function (res) {
      $scope.nombre = res.data.nombre;
      $scope.skills = res.data.skills;
    });
  });

<!-- perfil.html -->
<li ng-repeat="s in skills">{{ s }}</li>`,
  },
  {
    id: 'angular',
    name: 'Angular 17+',
    since: '2023',
    file: 'perfil.component.ts',
    code: `// perfil.component.ts
@Component({
  selector: 'app-perfil',
  template: \`
    <h1>{{ perfil().nombre }}</h1>
    @for (skill of perfil().skills; track skill) {
      <li>{{ skill }}</li>
    }
  \`,
})
export class PerfilComponent {
  private api = inject(PerfilService);
  perfil = toSignal(this.api.get(), { initialValue: VACIO });
}`,
  },
]

export type LogLine = { text: string; tone?: 'ok' | 'error' | 'muted' }

/** Salida del terminal en cada paso de la historia. */
export const LOGS = {
  toAngularJs: [
    { text: '$ bower install angular#1.x' },
    { text: '  descargando angular.js…', tone: 'muted' },
    { text: '✔ two-way data binding', tone: 'ok' },
    { text: "✔ adiós a los $('#selectores')", tone: 'ok' },
  ],
  failedUpdate: [
    { text: '$ ng update @angular/core@17' },
    { text: '✖ ERROR legacy_code_detected', tone: 'error' },
    { text: '  AngularJS no se actualiza con un comando:', tone: 'muted' },
    { text: '  hay que migrar controladores con $scope', tone: 'muted' },
  ],
  toAngular: [
    { text: '$ npm i @angular/upgrade   # app híbrida' },
    { text: '✔ controladores → componentes, poco a poco', tone: 'ok' },
    { text: '$ ng generate @angular/core:standalone' },
    { text: '✔ standalone components', tone: 'ok' },
    { text: '$ ng generate @angular/core:control-flow' },
    { text: '✔ *ngFor → @for · *ngIf → @if', tone: 'ok' },
    { text: '✔ signals · build OK · 0 errores', tone: 'ok' },
  ],
} satisfies Record<string, LogLine[]>
