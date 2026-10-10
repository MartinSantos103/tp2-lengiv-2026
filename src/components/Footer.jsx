import { Link } from 'react-router-dom';
import './Footer.css';
import { useGithubProfile } from '../hooks/useGithubProfile';

function Footer() {
  const {perfil, cargando, error} = useGithubProfile();

  if (cargando) return <p>Cargando datos de la API...</p>;
  if (error) return <p>{error}</p>;

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4 className="footer-heading">Navegación</h4>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Información de Contacto</h4>
          <ul className="footer-info">
            <li>
              <strong>Email:</strong> {perfil.email ?? "-"}
            </li>
            <li>
              <strong>Horario:</strong> -
            </li>
            <li>
              <strong>Ubicación:</strong> {perfil.location ?? "-"}
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
