import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { GamePage } from '../pages/GamePage'
import ResultPage from '../pages/ResultPage'
import { PreviewPage } from '../pages/PreviewPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route path="/game/:id" element={<GamePage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

