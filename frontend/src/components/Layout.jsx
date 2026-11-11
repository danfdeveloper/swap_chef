import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

function Layout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Swap Chef — publish, fork, and compare recipes.</p>
      </footer>
    </div>
  )
}

export default Layout
