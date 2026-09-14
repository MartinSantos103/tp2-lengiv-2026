import { Link } from "react-router-dom";
import './Navbar.css';

function Navbar() {
    return(
        <nav className="navbar">
            <Link to="/">Inicio</Link>
            <Link to="/servicios">Servicio</Link>
            <Link to="/contacto">Contacto</Link>
        </nav>
    );
}

export default Navbar;