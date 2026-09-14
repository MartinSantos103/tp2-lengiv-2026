import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Contacto from './pages/Contacto';
import Inicio from './pages/Inicio'
import Servicios from './pages/Servicios'

function App(){
  return(
    <>
      <Navbar />
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />
        </Routes>
    </>
  );
}

export default App;