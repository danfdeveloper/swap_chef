import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/Layout'
import BrowsePage from './pages/BrowsePage'
import ComparePage from './pages/ComparePage'
import FamilyTreePage from './pages/FamilyTreePage'
import LoginPage from './pages/LoginPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import RecipeEditorPage from './pages/RecipeEditorPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<BrowsePage />} />
            <Route path="recipes/new" element={<RecipeEditorPage />} />
            <Route path="recipes/:id" element={<RecipeDetailPage />} />
            <Route path="recipes/:id/edit" element={<RecipeEditorPage />} />
            <Route path="recipes/:id/compare" element={<ComparePage />} />
            <Route path="recipes/:id/lineage" element={<FamilyTreePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
