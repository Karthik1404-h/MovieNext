import { Film, Home, Compass, Bookmark, CheckCheck, Heart, Sparkles, ListFilter } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/watchlist', label: 'My Watchlist', icon: Bookmark },
  { to: '/watched', label: 'Watched', icon: CheckCheck },
  { to: '/favourites', label: 'Favourites', icon: Heart },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/tonight', label: 'Tonight', icon: ListFilter },
]

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">
            <Film size={18} />
          </div>
          <div>
            <span className="brand-name">MovieNext</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page-shell">{children}</main>
    </div>
  )
}
