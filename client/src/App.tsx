import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ReviewPage from './pages/ReviewPage'
import HistoryPage from './pages/HistoryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/review/:id" element={<ReviewPage />} />
        <Route path="/history" element={<HistoryPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App