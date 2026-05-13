export type LevelId = 'normal' | 'dificil' | 'chucknorris'

export type LevelConfig = {
  id: LevelId
  label: string
  subtitle: string
  spawnMs: number
  durationSec: number
  /** Multiplicador base de pontos por acerto */
  pointsMultiplier: number
  accent: string
}

export const LEVELS: LevelConfig[] = [
  {
    id: 'normal',
    label: 'Normal',
    subtitle: 'Tempo generoso, ideal para começar.',
    spawnMs: 1700,
    durationSec: 20,
    pointsMultiplier: 1,
    accent: '#5eead4',
  },
  {
    id: 'dificil',
    label: 'Difícil',
    subtitle: 'Mais pressa entre um mosquito e o próximo.',
    spawnMs: 1150,
    durationSec: 18,
    pointsMultiplier: 1.2,
    accent: '#fbbf24',
  },
  {
    id: 'chucknorris',
    label: 'Chuck Norris',
    subtitle: 'Sobrevive se puderes.',
    spawnMs: 720,
    durationSec: 15,
    pointsMultiplier: 1.45,
    accent: '#f87171',
  },
]

export const LEVEL_BY_ID: Record<LevelId, LevelConfig> = LEVELS.reduce(
  (acc, level) => {
    acc[level.id] = level
    return acc
  },
  {} as Record<LevelId, LevelConfig>,
)

export function isLevelId(value: string): value is LevelId {
  return value === 'normal' || value === 'dificil' || value === 'chucknorris'
}
