import { useGithubProfile } from '../hooks/useGithubProfile';

export default function Inicio() {
  const { perfil, cargando, error } = useGithubProfile();

  if (cargando) return <p>Cargando datos de la API...</p>;
  if (error) return <p>{error}</p>;

  return (
<main className="inicio-container">
      <h1>Perfil Destacado en Tecnología</h1>
      <p>Datos obtenidos en tiempo real desde la API pública de GitHub.</p>

      {perfil && (
        <section className="tarjeta-perfil">
          <img 
            src={perfil.avatar_url} 
            alt={`Avatar de ${perfil.name || perfil.login}`} 
            className="avatar-img"
          />

          <div className="datos-perfil">
            <h2>{perfil.name || perfil.login}</h2>
            <span className="username">@{perfil.login}</span>

            <p className="bio">{perfil.bio || "Desarrollador de software de código abierto."}</p>

            <p><strong>Repositorios públicos:</strong> {perfil.public_repos}</p>

            {perfil.location && <p><strong>Ubicación:</strong> {perfil.location}</p>}
            <p><strong>Seguidores:</strong> {perfil.followers}</p>

            <a 
              href={perfil.html_url} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-github"
            >
              Ver perfil completo en GitHub
            </a>
          </div>
        </section>
      )}
    </main>
  );
}