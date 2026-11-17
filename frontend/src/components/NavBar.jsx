import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function NavBar() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand">
          Swap Chef
        </NavLink>
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" end>
            Browse
          </NavLink>
          <NavLink to="/recipes/new">New recipe</NavLink>
          {loading ? null : isAuthenticated ? (
            <>
              <span className="nav-user">Hi, {user.username}</span>
              <button type="button" className="nav-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default NavBar
