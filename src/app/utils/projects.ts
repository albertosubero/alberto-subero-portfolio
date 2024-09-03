export const projects: projectI[] = [
  {
    title: 'Taclia',
    description: 'Es una herramienta digital diseñada para simplificar la gestión de negocio desde un solo lugar y al instante.',
    color: '#7269ff',
    images: [
      './assets/images/portfolio/taclia-logo.png',
      './assets/images/portfolio/taclia/taclia-calendario.png',
      './assets/images/portfolio/taclia/taclia-control-horario.png',
      './assets/images/portfolio/taclia/taclia-mobile.png'
    ],
    technologies: [
      'devicon-javascript-plain',
      'devicon-vuejs-plain',
      'devicon-react-original',
      'devicon-bootstrap-plain',
      'devicon-sass-original', 
      'devicon-azuresqldatabase-plain'
    ],
    url: 'https://www.taclia.com/'
  },
  {
    title: 'Dondoctor',
    description: 'Es un sistema de agendamiento online para IPS, Centros Médicos, Clínicas, Hospitales y Torres Médicas, que permite que el paciente autogestione sus citas a través de la web.',
    color: '#63cbb2',
    images: [
      './assets/images/portfolio/dondoctor-logo.png',
      './assets/images/portfolio/dondoctor/dondoctor-agendador-1.png',
      './assets/images/portfolio/dondoctor/dondoctor-agendador-2.png',
      './assets/images/portfolio/dondoctor/dondoctor-agendador-3.png'
    ],
    technologies: [
      'devicon-typescript-plain',
      'devicon-angularjs-plain',
      'devicon-rxjs-plain',
      'devicon-angularmaterial-plain',
      'devicon-nestjs-original',
      'devicon-mongodb-plain',
      'devicon-sass-original'
    ],
    url: 'https://dondoctor.com/'
  },
  {
    title: 'Playfan',
    description: 'Una aplicación desarrollada por un equipo de venezolanos, encontró una forma particular de que las personas se relacionaran: a través de videos en los que los usuarios indican sus gustos, mediante palabras claves, en una pieza de 15 segundos.',
    color: '#ff6969',
    images: [
      './assets/images/portfolio/playfan-logo.png',
      './assets/images/portfolio/playfan/playfan-flow.jpg'
    ],
    technologies: [
      'devicon-javascript-plain',
      'devicon-angularjs-plain',
      'devicon-bootstrap-plain',
      'devicon-css3-plain'
    ],
    url: 'https://www.youtube.com/watch?v=kyZ7U-El2OY'
  },
  {
    title: 'Oppous',
    description: 'Red social venezolana, LIFE + WORK son los dos perfiles con los que cuenta la app. La primera es ideal para el entretenimiento, en WORK los usuarios disponen de herramientas adicionales con las que podrán crear contenido interesante para los portales, crear proyectos personales o empresariales en la búsqueda de dar a conocer productos, ideas y servicios.',
    color: '#4581f9',
    images: [
      './assets/images/portfolio/oppous-logo.png'
    ],
    technologies: [
      'devicon-javascript-plain',
      'devicon-angularjs-plain',
      'devicon-bootstrap-plain',
      'devicon-css3-plain'
    ],
    url: 'https://www.youtube.com/watch?v=nNUvc9So4Y4'
  }
]

export interface projectI {
  title: string,
  description: string,
  color: string,
  images: string[],
  technologies: string[],
  url: string
}