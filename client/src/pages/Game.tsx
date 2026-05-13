import type { CSSProperties } from 'react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LEVEL_BY_ID, isLevelId, type LevelId } from '../config/levels'
import { MosquitoSprite } from '../components/MosquitoSprite'

type Mosquito = {
  id: number
  x: number
  y: number
  size: 52 | 72 | 92
  flipped: boolean
}

type EndState = 'running' | 'win' | 'lose'

const COMBO_WINDOW_MS = 2200
const BASE_HIT_SCORE = 48
const MAX_COMBO = 5
const LIVES_MAX = 3

function randomSize(): 52 | 72 | 92 {
  const r = Math.random()
  if (r < 0.34) return 52
  if (r < 0.67) return 72
  return 92
}

export function GamePage() {
  const { levelId = '' } = useParams()
  const navigate = useNavigate()
  const areaRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const endedRef = useRef<EndState>('running')
  const mosquitoRef = useRef<Mosquito | null>(null)
  const lastHitAt = useRef(0)
  const comboRef = useRef(1)

  const level = isLevelId(levelId) ? LEVEL_BY_ID[levelId as LevelId] : null

  const [boot, setBoot] = useState(0)
  const [paused, setPaused] = useState(false)
  const [mosquito, setMosquito] = useState<Mosquito | null>(null)
  const [lives, setLives] = useState(LIVES_MAX)
  const [timeLeft, setTimeLeft] = useState(20)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(1)
  const [hitFlash, setHitFlash] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [nickname, setNickname] = useState('')
  const [scoreSent, setScoreSent] = useState(false)

  useEffect(() => {
    if (!level) {
      navigate('/', { replace: true })
    }
  }, [level, navigate])

  useLayoutEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useLayoutEffect(() => {
    endedRef.current = result ?? 'running'
  }, [result])

  useLayoutEffect(() => {
    mosquitoRef.current = mosquito
  }, [mosquito])

  useLayoutEffect(() => {
    comboRef.current = combo
  }, [combo])

  const spawn = useCallback((): Mosquito => {
    const el = areaRef.current
    const w = el?.clientWidth ?? window.innerWidth
    const h = el?.clientHeight ?? window.innerHeight
    const hudTop = 96
    const margin = 14
    const size = randomSize()
    const minX = margin
    const maxX = Math.max(minX, w - size - margin)
    const minY = hudTop + margin
    const maxY = Math.max(minY, h - size - margin)
    const x = minX + Math.random() * (maxX - minX)
    const y = minY + Math.random() * (maxY - minY)
    return {
      id: Math.random(),
      x,
      y,
      size,
      flipped: Math.random() < 0.5,
    }
  }, [])

  const resetRound = useCallback(() => {
    const cfg = isLevelId(levelId) ? LEVEL_BY_ID[levelId as LevelId] : null
    if (!cfg) return
    endedRef.current = 'running'
    setResult(null)
    setPaused(false)
    setMosquito(null)
    setLives(LIVES_MAX)
    setTimeLeft(cfg.durationSec)
    setScore(0)
    setCombo(1)
    comboRef.current = 1
    setScoreSent(false)
    setNickname('')
    lastHitAt.current = 0
  }, [levelId])

  useEffect(() => {
    if (!level) return
    resetRound()
  }, [levelId, level, resetRound])

  const applyMiss = useCallback(() => {
    if (endedRef.current !== 'running') return
    setLives((lv) => {
      if (lv <= 1) {
        endedRef.current = 'lose'
        queueMicrotask(() => {
          setResult('lose')
          setMosquito(null)
        })
        return 0
      }
      return lv - 1
    })
    setCombo(1)
    comboRef.current = 1
    lastHitAt.current = 0
  }, [])

  useEffect(() => {
    if (!level || result) return
    const t = window.setTimeout(() => {
      if (endedRef.current === 'running' && !pausedRef.current) {
        setMosquito(spawn())
      }
    }, 220)
    return () => window.clearTimeout(t)
  }, [level, result, spawn, boot])

  useEffect(() => {
    if (!level || result) return
    const id = window.setInterval(() => {
      if (pausedRef.current || endedRef.current !== 'running') return
      if (mosquitoRef.current) {
        applyMiss()
      }
      if (endedRef.current !== 'running') return
      setMosquito(spawn())
    }, level.spawnMs)
    return () => window.clearInterval(id)
  }, [level, result, spawn, applyMiss])

  useEffect(() => {
    if (!level || result) return
    const t = window.setInterval(() => {
      if (pausedRef.current || endedRef.current !== 'running') return
      setTimeLeft((tl) => {
        if (tl <= 1) {
          endedRef.current = 'win'
          queueMicrotask(() => {
            setResult('win')
            setMosquito(null)
          })
          return 0
        }
        return tl - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [level, result])

  const restartSameLevel = () => {
    resetRound()
    setBoot((b) => b + 1)
  }

  const togglePause = useCallback(() => {
    if (result) return
    setPaused((p) => !p)
  }, [result])

  const togglePauseRef = useRef(togglePause)
  togglePauseRef.current = togglePause

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result) return
      if (e.code === 'Space' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        togglePauseRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result])

  const onHit = () => {
    if (!level || !mosquito || paused || result) return
    const now = performance.now()
    const withinCombo =
      lastHitAt.current > 0 && now - lastHitAt.current < COMBO_WINDOW_MS
    const nextCombo = withinCombo
      ? Math.min(MAX_COMBO, comboRef.current + 1)
      : 1
    lastHitAt.current = now
    comboRef.current = nextCombo
    setCombo(nextCombo)
    const gain = Math.round(BASE_HIT_SCORE * level.pointsMultiplier * nextCombo)
    setScore((s) => s + gain)
    setMosquito(null)
    setHitFlash(true)
    window.setTimeout(() => setHitFlash(false), 120)
  }

  const submitScore = async () => {
    if (!level || result !== 'win') return
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim() || 'Anónimo',
          score,
          level: level.id,
        }),
      })
      if (res.ok) setScoreSent(true)
    } catch {
      setScoreSent(false)
    }
  }

  if (!level) return null

  return (
    <div className="game-shell">
      <div
        className={`game-vignette${hitFlash ? ' game-vignette--hit' : ''}`}
        aria-hidden
      />

      <header className="game-hud">
        <div className="game-hud__cluster">
          <span className="game-hud__label">Tempo</span>
          <span className="game-hud__value game-hud__value--time">{timeLeft}s</span>
        </div>
        <div className="game-hud__cluster game-hud__cluster--center">
          <span className="game-hud__eyebrow">{level.label}</span>
          <div className="game-score">
            <span className="game-score__label">Pontos</span>
            <span className="game-score__value">{score}</span>
          </div>
          {combo > 1 && (
            <span
              className="game-combo"
              style={{ '--accent': level.accent } as CSSProperties}
            >
              Combo ×{combo}
            </span>
          )}
        </div>
        <div className="game-hud__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={togglePause}
            disabled={!!result}
          >
            {paused ? 'Continuar' : 'Pausa'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/')}
          >
            Sair
          </button>
        </div>
      </header>

      <div className="game-lives" aria-label="Vidas">
        {Array.from({ length: LIVES_MAX }).map((_, i) => (
          <span
            key={i}
            className={`game-heart${i < lives ? ' game-heart--full' : ''}`}
          >
            ♥
          </span>
        ))}
      </div>

      <div
        ref={areaRef}
        className={`game-area${paused ? ' game-area--paused' : ''}`}
        role="application"
        aria-label="Área de jogo"
      >
        {paused && !result && (
          <div className="game-overlay game-overlay--pause">
            <p>Pausado</p>
            <small>Espaço ou P para continuar</small>
          </div>
        )}
        {mosquito && !result && (
          <button
            type="button"
            className="game-mosquito-hit"
            style={{ left: mosquito.x, top: mosquito.y }}
            onClick={onHit}
            aria-label="Mosquito — clica para eliminar"
          >
            <MosquitoSprite
              size={mosquito.size}
              flipped={mosquito.flipped}
              className="game-mosquito-svg"
            />
          </button>
        )}
      </div>

      {result && (
        <div className="game-modal-backdrop" role="dialog" aria-modal="true">
          <div className="game-modal">
            <h2>{result === 'win' ? 'Vitória!' : 'Fim de jogo'}</h2>
            <p className="game-modal__score">
              Pontuação final: <strong>{score}</strong>
            </p>
            {result === 'win' && (
              <label className="game-modal__field">
                Nome no ranking
                <input
                  type="text"
                  maxLength={24}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Anónimo"
                />
              </label>
            )}
            <div className="game-modal__actions">
              {result === 'win' && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={submitScore}
                  disabled={scoreSent}
                >
                  {scoreSent ? 'Pontuação enviada' : 'Enviar pontuação'}
                </button>
              )}
              <button
                type="button"
                className="btn btn--primary"
                onClick={restartSameLevel}
              >
                Jogar outra vez
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => navigate('/')}
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
