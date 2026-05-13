import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { GamePage } from './pages/Game'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jogo/:levelId" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
