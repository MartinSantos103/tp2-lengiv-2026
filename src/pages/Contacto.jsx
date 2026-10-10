import ContactForm from '../components/ContactForm';
import './Pages.css';
import { useGithubProfile } from '../hooks/useGithubProfile';



export default function Contacto() {
  const { perfil, cargando, error } = useGithubProfile();

  const ubicacion = perfil?.location ? perfil.location : "Portland, USA";

  const mapQuery = encodeURIComponent(ubicacion);

  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <main className="contacto-page page">
      <h1 className="simple-page-title">Contacta con nosotros</h1>
      
      <div className="contacto-layout">
        
        <section className="formulario-seccion">
          <h2>Envíanos un mensaje</h2>
          <ContactForm />
        </section>

        <section className="mapa-seccion">
          <h2>Ubicación</h2>
          
          {cargando ? (
            <p>Cargando ubicación en el mapa...</p>
          ) : error ? (
            <p>Error al cargar la ubicación dinámica.</p>
          ) : null}

          <iframe
            title="Mapa de ubicación"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '8px' }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          ></iframe>
        </section>

      </div>
    </main>
  );
}