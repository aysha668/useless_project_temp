import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <nav className="navbar glass">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">◈</span>
          SCREEN DISPLAY FORENSICS
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>Analyze</Link>
          <Link to="/compare" className={location.pathname === '/compare' ? 'active' : ''}>Battle</Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Screen Display Forensics · Image-based visual anomaly analysis only</p>
      </footer>
    </div>
  );
}
