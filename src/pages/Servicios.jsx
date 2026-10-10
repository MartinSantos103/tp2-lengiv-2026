import './Pages.css';
import {skills} from '../data/skills';

export default function Servicios() {
  return(
    <main className="page">
      <h1 className="simple-page-title">Tecnologías y Servicios</h1>
      <div className='skills-grid'>
        {skills.map((skill) => (
          <div key={skill.id} className='skill-card'>
            <img src={skill.imagen} alt={skill.nombre} width="80" /> 
            <h2>{skill.nombre}</h2>
            <p>{skill.descripcion}</p>
            <span className="stack-badge">Stack: {skill.tecnologia}</span>  
          </div>
        ))}
      </div>
    </main>
  );
}