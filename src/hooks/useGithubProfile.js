import { useState, useEffect } from 'react';
import { obtenerPerfilGithub } from '../services/githubService';

const USUARIO_GITHUB = 'torvalds';

export function useGithubProfile() {
  
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerPerfilGithub(USUARIO_GITHUB)
      .then((datos) => { setPerfil(datos); setCargando(false); })
      .catch(() => { setError("Error al cargar"); setCargando(false); });
  }, []);

  return { perfil, cargando, error }; 
}