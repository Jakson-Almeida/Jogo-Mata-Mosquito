import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS } from '../config/levels'

export function HomePage() {
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/health')
      .then((r) => {
        if (!cancelled) setApiOk(r.ok)
      })
      .catch(() => {
        if (!cancelled) setApiOk(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="home">
      <div className="home__glow" aria-hidden />
      <header className="home__header">
        <p className="home__eyebrow">Arcade no browser</p>
        <h1 className="home__title">Mata Mosquito</h1>
        <p className="home__lede">
          Clica nos mosquitos antes que o tempo esgote. Acertos seguidos aumentam o
          combo e os pontos. Três vidas — sem pressa, com ritmo.
        </p>
        <p className="home__api" data-state={apiOk === null ? 'pending' : apiOk ? 'ok' : 'off'}>
          {apiOk === null && 'A verificar servidor…'}
          {apiOk === true && 'Servidor Node ligado — rankings disponíveis.'}
          {apiOk === false &&
            'Servidor offline — podes jogar na mesma; o ranking fica só local.'}
        </p>
      </header>

      <section className="home__levels" aria-label="Níveis">
        {LEVELS.map((level) => (
          <Link
            key={level.id}
            className="level-card"
            to={`/jogo/${level.id}`}
            style={{ '--accent': level.accent } as CSSProperties}
          >
            <h2 className="level-card__title">{level.label}</h2>
            <p className="level-card__subtitle">{level.subtitle}</p>
            <ul className="level-card__meta">
              <li>
                <span>Ronda</span> <strong>{level.durationSec}s</strong>
              </li>
              <li>
                <span>Novo mosquito</span> <strong>~{Math.round(level.spawnMs / 100) / 10}s</strong>
              </li>
              <li>
                <span>Bónus</span> <strong>×{level.pointsMultiplier}</strong>
              </li>
            </ul>
            <span className="level-card__cta">Começar →</span>
          </Link>
        ))}
      </section>

      <footer className="home__footer">
        <span>React + Vite · API Express · versão clássica na branch </span>
        <code>old</code>
      </footer>
    </div>
  )
}
