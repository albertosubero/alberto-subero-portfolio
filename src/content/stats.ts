import { profile } from './profile'

export type Stat = { value: number; prefix?: string; label: string; detail: string }

// Solo cifras que salen del propio CV
export const stats: Stat[] = [
  {
    value: 10,
    prefix: '+',
    label: 'años de experiencia',
    detail: 'como desarrollador frontend',
  },
  {
    value: profile.experience.length,
    label: 'empresas',
    detail: 'de Caracas a equipos 100% remotos',
  },
  {
    value: profile.projects.length,
    label: 'productos destacados',
    detail: 'de redes sociales a salud y gestión',
  },
  {
    value: profile.skills.length,
    label: 'tecnologías en el stack',
    detail: 'de Angular y RxJS a NestJS y SQL',
  },
  {
    value: 2,
    label: 'continentes',
    detail: 'equipos en Europa y Latinoamérica',
  },
]
