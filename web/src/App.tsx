// React
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Context
import { AuthProvider } from "./contexts/AuthContext"

// Route Guards
import { PrivateRoute } from "./routes/PrivateRoute"
import { PublicRoute } from "./routes/PublicRoute"

// Pages
import RegisterPage from "./pages/registerPage/RegisterPage.tsx"
import LoginPage from './pages/loginPage/LoginPage.tsx'
import DashboardPage from './pages/dashboard/DashboardPage.tsx'

function App() {
  return (  
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          {/* Rotas Privadas */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>  
  )
}

export default App
