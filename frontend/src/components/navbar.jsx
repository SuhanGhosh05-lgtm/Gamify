import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Enter', to: '/login' },
  { label: 'Register', to: '/register' },
];

export default function Navbar() {
  const { firebaseUser, gameData, logout } = useAuth();
  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="Life RPG home">
          <span className="brand-mark" aria-hidden="true">✦</span>
          Life RPG
        </Link>
        <div className="nav-links">
          {firebaseUser ? <>
            <span className="player-name">{gameData?.user?.displayName || firebaseUser.displayName || 'Adventurer'}</span>
            <button className="logout-button" type="button" onClick={logout}>Log out</button>
          </> : links.map(({ label, to }) => (
            <NavLink key={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={to}>{label}</NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
