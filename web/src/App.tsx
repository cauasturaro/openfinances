// React
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages
import RegisterPage from "./pages/registerPage/RegisterPage.tsx"
import LoginPage from './pages/loginPage/LoginPage.tsx'

function App() {
  return (    
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
