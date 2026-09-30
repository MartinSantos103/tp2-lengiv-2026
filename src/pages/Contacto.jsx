import ContactForm from '../components/ContactForm';
import './Pages.css';

function Contacto() {
  return (
    <div className="page contact-page">
      <h1 className="simple-page-title">Contáctanos</h1>
      <div className="contact-form-single">
        <ContactForm />
      </div>
    </div>
  );
}

export default Contacto;