import axios from 'axios';

const BASE_URL = 'https://api.github.com/users';

export const obtenerPerfilGithub = async (usuario) => {
  try {
    const respuesta = await axios.get(`${BASE_URL}/${usuario}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener datos de ${usuario}:`, error);
    throw error; 
  }
};