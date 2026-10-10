import { useGithubProfile } from '../hooks/useGithubProfile';

export default function Inicio() {
  const { perfil, cargando, error } = useGithubProfile();

  if (cargando) return <p>Cargando datos de la API...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="inicio-container page">
      <h1 className="simple-page-title">Perfil Destacado en Tecnología</h1>
      <p style={{textAlign: 'center', marginBottom: '2rem'}}>Datos obtenidos en tiempo real desde la API pública de GitHub.</p>

      {perfil && (
        <section className="tarjeta-perfil-horizontal">
          <img 
            src={perfil.avatar_url} 
            alt={`Avatar de ${perfil.name || perfil.login}`} 
            className="avatar-img-large"
          />

          <div className="datos-perfil-detalles">
            <div className="perfil-header">
              <h2>{perfil.name || perfil.login}</h2>
              <span className="username">@{perfil.login}</span>
            </div>

            <p className="bio">{perfil.bio || "Desarrollador de software de código abierto."}</p>

            <div className="perfil-stats">
              <div className="stat-item">
                <span className="stat-value">{perfil.public_repos}</span>
                <span className="stat-label">Repositorios</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{perfil.followers}</span>
                <span className="stat-label">Seguidores</span>
              </div>
              {perfil.location && (
                <div className="stat-item">
                  <span className="stat-value location-text">{perfil.location}</span>
                  <span className="stat-label">Ubicación</span>
                </div>
              )}
            </div>

            <a 
              href={perfil.html_url} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-github"
            >
              Ver perfil en GitHub
            </a>
          </div>
        </section>
      )}
    </main>
  );
}