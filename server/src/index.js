import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT) || 3001

const distPath = path.join(__dirname, '../../client/dist')

app.use(cors())
app.use(express.json())

/** Pontuações em memória (reset ao reiniciar o servidor) */
const scores = []

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'mata-mosquito' })
})

app.get('/api/scores', (_req, res) => {
  const top = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  res.json(top)
})

app.post('/api/scores', (req, res) => {
  const { nickname, score, level } = req.body || {}
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return res.status(400).json({ error: 'score inválido' })
  }
  const entry = {
    nickname: typeof nickname === 'string' && nickname.trim() ? nickname.trim().slice(0, 24) : 'Anónimo',
    score: Math.max(0, Math.floor(score)),
    level: typeof level === 'string' ? level.slice(0, 32) : '',
    at: Date.now(),
  }
  scores.push(entry)
  res.status(201).json({ ok: true })
})

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'não encontrado' })
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`API Mata Mosquito em http://localhost:${PORT}`)
  if (fs.existsSync(distPath)) {
    console.log(`A servir frontend estático de ${distPath}`)
  }
})
