import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../content/profile'
import styles from './ClassicCV.module.css'

/** La pastilla azul: el CV de siempre, rápido, accesible y sin efectos. */
export function ClassicCV({ onMatrix }: { onMatrix: () => void }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <motion.main
      className={styles.root}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <header className={styles.header}>
        <div>
          <h1>{profile.name}</h1>
          <p className={styles.role}>
            {profile.role} | {profile.stack}
          </p>
          {profile.available && <p className={styles.available}>Disponible para trabajar</p>}
        </div>
        <div className={styles.actions}>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.cvUrl} target="_blank" rel="noreferrer">
            Descargar CV
          </a>
        </div>
      </header>

      <section>
        <h2>Sobre mí</h2>
        <p>{profile.about}</p>
      </section>

      <section>
        <h2>Experiencia</h2>
        {profile.experience.map((job) => (
          <article key={job.company} className={styles.job}>
            <h3>{job.role}</h3>
            <p className={styles.meta}>
              {job.company} · {job.place} · {job.period}
            </p>
            <p>{job.summary}</p>
          </article>
        ))}
      </section>

      <section>
        <h2>Proyectos</h2>
        {profile.projects.map((project) => (
          <article key={project.name} className={styles.job}>
            <h3>
              {project.url ? (
                <a href={project.url} target="_blank" rel="noreferrer">
                  {project.name} ↗
                </a>
              ) : (
                project.name
              )}
            </h3>
            <p>{project.summary}</p>
            <p className={styles.meta}>{project.tags.join(' · ')}</p>
          </article>
        ))}
      </section>

      <section>
        <h2>Tecnologías</h2>
        <ul className={styles.tags}>
          {profile.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <p className={styles.meta}>También: {profile.extraSkills}</p>
      </section>

      <section>
        <h2>Formación</h2>
        {profile.education.map((item) => (
          <p key={item.title}>
            <strong>{item.title}</strong> — {item.school}
          </p>
        ))}
      </section>

      <footer className={styles.footer}>
        <button type="button" onClick={onMatrix}>
          ¿Has cambiado de opinión? Toma la pastilla roja
        </button>
      </footer>
    </motion.main>
  )
}
