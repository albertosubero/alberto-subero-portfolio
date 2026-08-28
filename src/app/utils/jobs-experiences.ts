export const experiences: experienceI[] = [
  {
    title: 'Senior Frontend Developer',
    company: 'Belender',
    type: 'Remoto',
    date: 'Nov 2025 - actualmente',
    detail: 'Modernización de un producto legacy en Angular 14 con migración progresiva a Angular 17+, standalone components y control flow moderno. Implementación de estado reactivo con Signals, refactorización de código legacy hacia servicios tipados y reutilizables, y suite de tests unitarios con Jasmine/Karma junto a ESLint y Prettier.',
    technologies: [
      'devicon-typescript-plain',
      'devicon-angularjs-plain',
      'devicon-rxjs-plain',
      'devicon-angularmaterial-plain',
      'devicon-jasmine-original',
      'devicon-sass-original',
      'devicon-git-plain'
    ]
  },
  {
    title: 'Frontend Lead',
    company: 'Card Software',
    type: 'Remoto',
    date: 'Feb 2025 - Oct 2025',
    detail: 'Liderazgo del equipo frontend: code review y aprobación de Pull Requests, definición de la arquitectura de desarrollo e incorporación de nuevas tecnologías. Desarrollo de plataformas web SPA con Angular 18 y PrimeNG, y definición de prototipos UI/UX junto al equipo de diseño.',
    technologies: [
      'devicon-typescript-plain',
      'devicon-angularjs-plain',
      'devicon-rxjs-plain',
      'devicon-sass-original',
      'devicon-html5-plain',
      'devicon-git-plain'
    ]
  },
  {
    title: 'Senior Frontend Developer | Consultor',
    company: 'Dondoctor',
    type: 'Remoto',
    date: 'Dic 2023 - Feb 2025',
    detail: 'Mantenimiento y desarrollo de nuevas vistas y features para las plataformas de la empresa. Desarrollo del nuevo agendador de citas médicas con Angular 18 y NgBootstrap, mejorando el rendimiento del producto final, y creación de la primera documentación del entorno de desarrollo.',
    technologies: [
      'devicon-typescript-plain',
      'devicon-angularjs-plain',
      'devicon-javascript-plain',
      'devicon-react-original',
      'devicon-bootstrap-plain',
      'devicon-sass-original',
      'devicon-azuresqldatabase-plain'
    ]
  },
  {
    title: 'Angular Frontend Developer',
    company: 'Taclia',
    type: 'Remoto',
    date: '2021 - 2023',
    detail: 'Desarrollo de features, vistas y componentes reactivos con obtención de datos del API a través de servicios y controladores. Actualización de la UI y mejora del rendimiento de la plataforma, eliminando código duplicado mediante componentes reutilizables, con unit testing y pruebas en móvil y escritorio.',
    technologies: [
      'devicon-typescript-plain',
      'devicon-angularjs-plain',
      'devicon-ionic-original',
      'devicon-rxjs-plain',
      'devicon-angularmaterial-plain',
      'devicon-nestjs-original',
      'devicon-mongodb-plain',
      'devicon-sass-original'
    ]
  },
  {
    title: 'Líder Frontend',
    company: '2Laabs Technologies',
    type: 'Híbrido',
    date: '2018 - 2021',
    detail: 'Liderar el equipo de desarrollo frontend implementando arquitecturas con las mejores tecnologías y prácticas del momento, adaptadas a las necesidades de cada cliente. Desarrollo de plataformas web SPA con Angular 2+, Angular Material y NodeJS para clientes locales e internacionales.',
    technologies: [
      'devicon-typescript-plain',
      'devicon-angularjs-plain',
      'devicon-angularmaterial-plain',
      'devicon-nodejs-plain',
      'devicon-sass-original'
    ]
  },
  {
    title: 'Frontend Developer',
    company: 'Icterus Technologies',
    type: 'Caracas, Venezuela',
    date: '2017 - 2018',
    detail: 'Desarrollo de aplicaciones y plataformas web SPA con React, Firebase y React Native, junto a APIs con ASP.NET Core para clientes internacionales. Etapa de crecimiento aprendiendo nuevas tecnologías, arquitecturas y buenas prácticas de desarrollo.',
    technologies: [
      'devicon-javascript-plain',
      'devicon-react-original',
      'devicon-firebase-plain',
      'devicon-dotnetcore-plain'
    ]
  },
  {
    title: 'Jr Frontend Developer',
    company: 'Oppous LLC',
    type: 'Caracas, Venezuela',
    date: '2015 - 2017',
    detail: 'Desarrollo y mantenimiento de aplicaciones y páginas web dinámicas con AngularJS, JavaScript, Less y Angular Material, además de gestión de sitios en WordPress y Elementor. Primeros pasos en arquitectura de componentes y desarrollo frontend profesional.',
    technologies: [
      'devicon-javascript-plain',
      'devicon-angularjs-plain',
      'devicon-angularmaterial-plain',
      'devicon-wordpress-plain',
      'devicon-css3-plain'
    ]
  }
]


export interface experienceI {
  title: string,
  company: string,
  type: string,
  date: string,
  detail: string,
  technologies: string[]
}
