export const experiences: experienceI[] = [
  {
    title: 'Desarrollador Frontend',
    company: 'Dondoctor',
    type: 'Remoto',
    date: '2021 - actualmente',
    detail: 'Mantenimiento y desarrollo de nuevas vistas y features para las distintas plataformas de la empresa.',
    technologies: [
      'devicon-javascript-plain',
      'devicon-vuejs-plain',
      'devicon-react-original',
      'devicon-bootstrap-plain',
      'devicon-sass-original', 
      'devicon-azuresqldatabase-plain'
    ]
  },
  {
    title: 'Desarrollador Frontend Semi-Senior',
    company: 'Taclia',
    type: 'Remoto',
    date: '2021 - 2024',
    detail: 'Desarrollo features, vistas y componentes reactivos, con obtención de datos del API a través de servicios y controladores.',
    technologies: [
      'devicon-typescript-plain',
      'devicon-angularjs-plain',
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
    detail: 'Liderar equipo de desarrollo frontend, implementando arquitecturas de desarrollo con las mejores tecnologías y prácticas del momento, adaptado a las necesidades de cada cliente.',
    technologies: [
      'devicon-javascript-plain',
      'devicon-angularjs-plain',
      'devicon-angularmaterial-plain',
      'devicon-react-original',
      'devicon-sass-original'
    ]
  },
  {
    title: 'Desarrollador Frontend',
    company: 'Icterus Technologies',
    type: 'Híbrido',
    date: '2017 - 2018',
    detail: 'Desarrollo de aplicaciones web SPA con React js, Angular 2 y Bootstrap, adaptado a las necesidades de cada proyecto.',
    technologies: [
      'devicon-javascript-plain',
      'devicon-angularjs-plain',
      'devicon-react-original',
      'devicon-bootstrap-plain',
      'devicon-sass-original'
    ]
  },
  {
    title: 'Desarrollador Frontend Junior',
    company: 'Oppous LLC',
    type: 'Presencial',
    date: '2015 - 2017',
    detail: 'Desarrollo de aplicaciones web SPA con Angular js y Bootstrap, participando en el desarrollo de 2 proyectos de redes sociales y de trabajo.',
    technologies: [
      'devicon-javascript-plain',
      'devicon-angularjs-plain',
      'devicon-bootstrap-plain',
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