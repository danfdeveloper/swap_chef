import { NavLink } from 'react-router-dom'

function NavBar() {
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
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default NavBar
