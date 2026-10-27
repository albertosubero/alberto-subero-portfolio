// Fuente única del contenido del CV. Tanto la experiencia Matrix como el CV clásico leen de aquí.

import type { Portrait } from '../lib/portrait'

export type ModuleKind = 'invoice' | 'quote' | 'clock' | 'tasks' | 'booking'

/** Tarjeta del túnel: una maqueta de módulo dibujada en CSS o una imagen (captura o logo). */
export type ProjectCard = { name: string; kind: ModuleKind } | { name: string; image: string; logo?: boolean }

export type Project = {
  name: string
  summary: string
  url: string | null
  color: string
  tags: string[]
  cards: ProjectCard[]
}

export const profile = {
  name: 'Alberto Subero',
  role: 'Senior Frontend Developer',
  stack: 'Angular',
  email: 'avsg1991@gmail.com',
  available: true,
  cvUrl: '/assets/alberto-subero-senior-frontend-developer-angular-cv-es.pdf',
  linkedin: 'https://www.linkedin.com/in/albertosubero/',
  github: 'https://github.com/albertosubero',
  // Foto en /public. `crop` encuadra cara y hombros; `focus` es el óvalo que se conserva
  // (el fondo de fuera se funde). Con null, la lluvia dibuja el nombre y el retrato una silueta.
  portrait: {
    src: '/portrait.jpg',
    crop: { x: 0.18, y: 0.21, w: 0.64, h: 0.53 },
    focus: { x: 0.5, y: 0.52, rx: 0.42, ry: 0.56 },
  } as Portrait | null,

  about:
    'Con más de 10 años de experiencia como Senior Frontend Developer, me he especializado en Angular y su ecosistema: arquitecturas escalables, liderazgo técnico y modernización de productos legacy para empresas B2B y B2C en Europa y Latinoamérica. Disfruto todo el proceso de creación de UIs, desde la primera lluvia de ideas, wireframes y maquetas hasta el producto final. Complemento mi stack con NestJS, SQL y herramientas de desarrollo asistido por IA como Claude Code y GitHub Copilot.',

  experience: [
    {
      role: 'Senior Frontend Developer',
      company: 'Belender',
      place: 'Remoto',
      period: 'Nov 2025 — actualmente',
      summary:
        'Modernización de un producto legacy en Angular 14 con migración progresiva a Angular 17+, standalone components y control flow moderno. Estado reactivo con Signals, refactorización hacia servicios tipados y reutilizables, y suite de tests unitarios con Jasmine/Karma junto a ESLint y Prettier.',
    },
    {
      role: 'Frontend Lead',
      company: 'Card Software',
      place: 'Remoto',
      period: 'Feb 2025 — Oct 2025',
      summary:
        'Liderazgo del equipo frontend: code review y aprobación de Pull Requests, definición de la arquitectura e incorporación de nuevas tecnologías. Plataformas web SPA con Angular 18 y PrimeNG, y prototipos UI/UX junto al equipo de diseño.',
    },
    {
      role: 'Senior Frontend Developer · Consultor',
      company: 'Dondoctor',
      place: 'Remoto',
      period: 'Dic 2023 — Feb 2025',
      summary:
        'Mantenimiento y desarrollo de nuevas vistas y features para las plataformas de la empresa. Desarrollo del nuevo agendador de citas médicas con Angular 18 y NgBootstrap, mejorando el rendimiento del producto final, y creación de la primera documentación del entorno de desarrollo.',
    },
    {
      role: 'Angular Frontend Developer',
      company: 'Taclia',
      place: 'Remoto',
      period: '2021 — 2023',
      summary:
        'Desarrollo de features, vistas y componentes reactivos con obtención de datos del API a través de servicios y controladores. Actualización de la UI y mejora del rendimiento de la plataforma, eliminando código duplicado mediante componentes reutilizables, con unit testing y pruebas en móvil y escritorio.',
    },
    {
      role: 'Líder Frontend',
      company: '2Laabs Technologies',
      place: 'Híbrido',
      period: '2018 — 2021',
      summary:
        'Liderar el equipo de desarrollo frontend implementando arquitecturas con las mejores tecnologías y prácticas del momento, adaptadas a las necesidades de cada cliente. Desarrollo de plataformas web SPA con Angular 2+, Angular Material y NodeJS para clientes locales e internacionales.',
    },
    {
      role: 'Frontend Developer',
      company: 'Icterus Technologies',
      place: 'Caracas, Venezuela',
      period: '2017 — 2018',
      summary:
        'Desarrollo de aplicaciones y plataformas web SPA con React, Firebase y React Native, junto a APIs con ASP.NET Core para clientes internacionales. Etapa de crecimiento aprendiendo nuevas tecnologías, arquitecturas y buenas prácticas de desarrollo.',
    },
    {
      role: 'Jr Frontend Developer',
      company: 'Oppous LLC',
      place: 'Caracas, Venezuela',
      period: '2015 — 2017',
      summary:
        'Desarrollo y mantenimiento de aplicaciones y páginas web dinámicas con AngularJS, JavaScript, Less y Angular Material, además de gestión de sitios en WordPress y Elementor. Primeros pasos en arquitectura de componentes y desarrollo frontend profesional.',
    },
  ],

  // Cada proyecto vuela por el túnel del Acto 7: sus `cards` son capturas, logos o maquetas
  projects: [
    {
      name: 'Taclia',
      summary:
        'Herramienta digital para gestionar un negocio desde un solo lugar: facturas, presupuestos, control horario, tareas, booking y más.',
      url: 'https://www.taclia.com/',
      color: '#7269ff',
      tags: ['TypeScript', 'Angular', 'RxJS', 'Angular Material', 'NestJS', 'MongoDB', 'Sass'],
      cards: [
        { name: 'Taclia', image: '/assets/images/portfolio/taclia-capture.jpg' },
        { name: 'Facturas', kind: 'invoice' },
        { name: 'Presupuestos', kind: 'quote' },
        { name: 'Taclia', image: '/assets/images/portfolio/taclia-logo.png', logo: true },
        { name: 'Control horario', kind: 'clock' },
        { name: 'Tareas', kind: 'tasks' },
        { name: 'Booking', kind: 'booking' },
      ] as ProjectCard[],
    },
    {
      name: 'Dondoctor',
      summary:
        'Sistema de agendamiento online para IPS, centros médicos, clínicas, hospitales y torres médicas, que permite al paciente autogestionar sus citas a través de la web.',
      url: 'https://www.dondoctor.com/',
      color: '#63cbb2',
      tags: ['JavaScript', 'Vue', 'React', 'Bootstrap', 'Sass', 'Azure SQL'],
      cards: [
        { name: 'Dondoctor', image: '/assets/images/portfolio/dondoctor-capture.jpg' },
        { name: 'Dondoctor', image: '/assets/images/portfolio/dondoctor-logo.png', logo: true },
        { name: 'Agenda', kind: 'booking' },
      ],
    },
    {
      name: 'Playfan',
      summary:
        'App creada por un equipo venezolano que conecta a las personas a través de vídeos de 15 segundos en los que indican sus gustos mediante palabras clave.',
      url: 'https://www.youtube.com/watch?v=kyZ7U-El2OY',
      color: '#ff6969',
      tags: ['JavaScript', 'AngularJS', 'Bootstrap', 'CSS'],
      cards: [
        { name: 'Playfan', image: '/assets/images/portfolio/playfan-capture.jpg' },
        { name: 'Playfan', image: '/assets/images/portfolio/playfan-logo.png', logo: true },
      ],
    },
    {
      name: 'Oppous',
      summary:
        'Red social venezolana con dos perfiles: LIFE, para el entretenimiento, y WORK, con herramientas para crear proyectos personales o empresariales y dar a conocer productos, ideas y servicios.',
      url: 'https://www.youtube.com/watch?v=nNUvc9So4Y4',
      color: '#4581f9',
      tags: ['JavaScript', 'AngularJS', 'Bootstrap', 'CSS'],
      cards: [
        { name: 'Oppous', image: '/assets/images/portfolio/oppous-capture.jpg' },
        { name: 'Oppous', image: '/assets/images/portfolio/oppous-logo.png', logo: true },
      ],
    },
  ] as Project[],

  skills: [
    'Angular', 'TypeScript', 'JavaScript', 'RxJS', 'Ionic', 'React', 'Vue', 'Redux', 'jQuery',
    'HTML', 'CSS', 'Sass', 'Tailwind', 'Angular Material', 'Bootstrap', 'Node.js', 'NestJS',
    'Express', 'MongoDB', 'SQL', 'MySQL', 'Jasmine', 'Karma', 'Git',
  ],
  extraSkills:
    'Angular Signals, NgRx, PrimeNG, Ant Design, Prettier, Unit Testing, Clean Code, MVC, OOP, Pixel Perfect, GitFlow, SCRUM y desarrollo asistido por IA con Claude Code, GitHub Copilot y Prompt Engineering.',

  education: [
    { title: 'Diplomado de Programación', school: 'Instituto de Nuevas Tecnologías Uneweb' },
    { title: 'Programación Web Full Stack', school: 'Acamica University' },
  ],
}
