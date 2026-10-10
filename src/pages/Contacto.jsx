import ContactForm from '../components/ContactForm';
import './Pages.css';
import { useGithubProfile } from '../hooks/useGithubProfile';



export default function Contacto() {
  const { perfil, cargando, error } = useGithubProfile();

  const ubicacion = perfil?.location ? perfil.location : "Portland, USA";

  const mapQuery = encodeURIComponent(ubicacion);

  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <main className="contacto-page">
      <h1>Contacta con nosotros</h1>
      
      <div className="contacto-layout" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        <section className="formulario-seccion" style={{ flex: '1', minWidth: '300px' }}>
          <h2>Envíanos un mensaje</h2>
          <ContactForm />
        </section>

        <section className="mapa-seccion" style={{ flex: '1', minWidth: '300px' }}>
          <h2>Nuestra Ubicación (Basada en el Perfil)</h2>
          
          {cargando ? (
            <p>Cargando ubicación en el mapa...</p>
          ) : error ? (
            <p>Error al cargar la ubicación dinámica. Mostrando sede central.</p>
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