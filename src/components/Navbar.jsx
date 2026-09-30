import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <header className="site-header">
      <div className="navbar-container">
        <nav className="navbar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/servicios"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Servicios
          </NavLink>
          <NavLink
            to="/contacto"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Contacto
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;