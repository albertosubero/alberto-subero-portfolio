// Acto 5: el stack del CV agrupado en estanterías (todo sale de profile.skills y extraSkills).

export type Rack = { name: string; items: string[] }

export const racks: Rack[] = [
  {
    name: 'Núcleo Angular',
    items: ['Angular', 'TypeScript', 'JavaScript', 'RxJS', 'Angular Signals', 'NgRx'],
  },
  {
    name: 'Interfaz y estilos',
    items: ['HTML', 'CSS', 'Sass', 'Tailwind', 'Angular Material', 'PrimeNG', 'Bootstrap', 'Ant Design'],
  },
  {
    name: 'Otros frameworks',
    items: ['React', 'Vue', 'Redux', 'Ionic', 'jQuery'],
  },
  {
    name: 'Backend y datos',
    items: ['Node.js', 'NestJS', 'Express', 'MongoDB', 'SQL', 'MySQL'],
  },
  {
    name: 'Calidad',
    items: ['Jasmine', 'Karma', 'Unit Testing', 'Prettier', 'Clean Code', 'Pixel Perfect'],
  },
  {
    name: 'Flujo e IA',
    items: ['Git', 'GitFlow', 'SCRUM', 'Claude Code', 'GitHub Copilot', 'Prompt Engineering'],
  },
]
