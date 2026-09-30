import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './ContactForm.css';

// Variables de entorno de Vite con fallback por defecto
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'TU_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'TU_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'TU_PUBLIC_KEY';

const MAX_MESSAGE_LENGTH = 300;
const MIN_MESSAGE_LENGTH = 10;
const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = 'contact_form_last_submission';

// Expresión regular para validar formato de correo electrónico
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Expresión regular para Nombre y Apellido (solo letras y espacios, incluyendo acentos y diéresis)
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜ\s]+$/;

// Función para calcular segundos de cooldown restantes según localStorage
const getRemainingCooldown = () => {
  try {
    const lastTimestamp = localStorage.getItem(STORAGE_KEY);
    if (!lastTimestamp) return 0;
    const elapsedSeconds = Math.floor((Date.now() - parseInt(lastTimestamp, 10)) / 1000);
    const remaining = COOLDOWN_SECONDS - elapsedSeconds;
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
};

function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: '',
  });

  // Campo señuelo honeypot para engañar y filtrar bots
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }
  const [cooldown, setCooldown] = useState(getRemainingCooldown);

  // Temporizador para cuenta regresiva del rate limiting (1 envío por minuto)
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  // Función de validación por campo individual
  const validateField = (name, value) => {
    const trimmed = value.trim();

    switch (name) {
      case 'nombre':
        if (!trimmed) {
          return 'El Nombre y Apellido es obligatorio.';
        }
        if (trimmed.length < 3) {
          return 'Debe ingresar al menos 3 caracteres.';
        }
        if (!NAME_REGEX.test(trimmed)) {
          return 'El nombre solo puede contener letras y espacios.';
        }
        return '';

      case 'email':
        if (!trimmed) {
          return 'El Correo Electrónico es obligatorio.';
        }
        if (!EMAIL_REGEX.test(trimmed)) {
          return 'Ingrese un formato de correo electrónico válido (ej. usuario@dominio.com).';
        }
        return '';

      case 'mensaje':
        if (!trimmed) {
          return 'El Mensaje es obligatorio.';
        }
        if (trimmed.length < MIN_MESSAGE_LENGTH) {
          return `El mensaje debe contener al menos ${MIN_MESSAGE_LENGTH} caracteres.`;
        }
        if (value.length > MAX_MESSAGE_LENGTH) {
          return `El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.`;
        }
        return '';

      default:
        return '';
    }
  };

  // Validar la totalidad de los campos del formulario
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    return newErrors;
  };

  // Manejador del cambio de valor en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mensaje' && value.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Manejador de evento onBlur (al perder foco)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Control de Rate Limiting con localStorage (máx 1 por minuto)
    const currentRemaining = getRemainingCooldown();
    if (currentRemaining > 0) {
      setCooldown(currentRemaining);
      setFeedback({
        type: 'error',
        message: `Por seguridad, solo se permite un envío por minuto. Espera ${currentRemaining} segundo${
          currentRemaining !== 1 ? 's' : ''
        } antes de intentar nuevamente.`,
      });
      return;
    }

    // 2. Control de Honeypot antispam
    // Si el campo señuelo viene con contenido, es un bot: NO llamamos a EmailJS
    if (honeypot.trim() !== '') {
      setIsSubmitting(true);
      // Simulamos respuesta exitosa para despistar al bot sin consumir cuota de EmailJS
      setTimeout(() => {
        setIsSubmitting(false);
        setFeedback({
          type: 'success',
          message: '¡Tu mensaje ha sido enviado exitosamente! Nos pondremos en contacto a la brevedad.',
        });
        setFormData({ nombre: '', email: '', mensaje: '' });
        setHoneypot('');
        setTouched({});
        setErrors({});
        try {
          localStorage.setItem(STORAGE_KEY, Date.now().toString());
          setCooldown(COOLDOWN_SECONDS);
        } catch {
          // Ignorar fallo de almacenamiento
        }
      }, 500);
      return;
    }

    // Marcar todos los campos como tocados
    setTouched({
      nombre: true,
      email: true,
      mensaje: true,
    });

    const validationErrors = validateAll();
    setErrors(validationErrors);

    // Si existen errores, enfocar el primer campo inválido
    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstInvalidField);
      if (element) {
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const templateParams = {
        from_name: formData.nombre.trim(),
        from_email: formData.email.trim(),
        message: formData.mensaje.trim(),
        to_name: 'Equipo de Soporte',
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      // Registrar marca de tiempo en localStorage para activar el cooldown de 60s
      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch (storageErr) {
        console.warn('No se pudo guardar la marca de tiempo en localStorage:', storageErr);
      }
      setCooldown(COOLDOWN_SECONDS);

      setFeedback({
        type: 'success',
        message: '¡Tu mensaje ha sido enviado exitosamente! Nos pondremos en contacto a la brevedad.',
      });

      // Limpiar formulario y estados de validación
      setFormData({
        nombre: '',
        email: '',
        mensaje: '',
      });
      setTouched({});
      setErrors({});
    } catch (err) {
      console.error('Error al enviar el correo con EmailJS:', err);
      setFeedback({
        type: 'error',
        message:
          'No se pudo conectar con el servicio de correo o las credenciales no son válidas. Por favor, verifica tu conexión o las claves de EmailJS.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = MAX_MESSAGE_LENGTH - formData.mensaje.length;
  const isNearLimit = remainingChars <= 30;

  return (
    <div className="contact-card">
      <div className="contact-card-header">
        <div className="contact-icon-bubble">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <div>
          <h2 className="contact-card-title">Envíanos un Mensaje</h2>
          <p className="contact-card-subtitle">
            Completa el siguiente formulario y responderemos a la brevedad.
          </p>
        </div>
      </div>

      {/* Alerta de Cooldown si el usuario intenta enviar antes del minuto */}
      {cooldown > 0 && !feedback && (
        <div className="cooldown-banner" role="status" aria-live="polite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>
            Próximo envío disponible en <strong>{cooldown}s</strong> (límite de 1 mensaje por minuto).
          </span>
        </div>
      )}

      {feedback && (
        <div
          className={`form-alert form-alert-${feedback.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="alert-content">
            {feedback.type === 'success' ? (
              <svg
                className="alert-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg
                className="alert-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            className="alert-close"
            onClick={() => setFeedback(null)}
            aria-label="Cerrar notificación"
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="contact-form">
        {/* Campo Honeypot para trampear a los bots (NO usar display: none para que los bots lo vean) */}
        <div className="honeypot-field" aria-hidden="true">
          <label htmlFor="website">Website (dejar vacío)</label>
          <input
            type="text"
            id="website"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Campo: Nombre y Apellido */}
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">
            Nombre y Apellido <span className="required-mark">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Ej. Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${
                touched.nombre && errors.nombre ? 'input-error' : ''
              } ${
                touched.nombre && !errors.nombre && formData.nombre
                  ? 'input-valid'
                  : ''
              }`}
              aria-invalid={touched.nombre && !!errors.nombre}
              aria-describedby={
                touched.nombre && errors.nombre ? 'nombre-error' : undefined
              }
              disabled={isSubmitting}
            />
          </div>
          {touched.nombre && errors.nombre && (
            <p id="nombre-error" className="error-message">
              <span className="error-icon" aria-hidden="true">&#9888;</span>
              {errors.nombre}
            </p>
          )}
        </div>

        {/* Campo: Correo Electrónico */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Correo Electrónico <span className="required-mark">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="nombre@correo.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${
                touched.email && errors.email ? 'input-error' : ''
              } ${
                touched.email && !errors.email && formData.email
                  ? 'input-valid'
                  : ''
              }`}
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={
                touched.email && errors.email ? 'email-error' : undefined
              }
              disabled={isSubmitting}
            />
          </div>
          {touched.email && errors.email && (
            <p id="email-error" className="error-message">
              <span className="error-icon" aria-hidden="true">&#9888;</span>
              {errors.email}
            </p>
          )}
        </div>

        {/* Campo: Mensaje */}
        <div className="form-group">
          <div className="label-with-counter">
            <label htmlFor="mensaje" className="form-label">
              Mensaje <span className="required-mark">*</span>
            </label>
            <span
              className={`char-counter ${isNearLimit ? 'counter-warning' : ''}`}
              aria-live="polite"
            >
              {formData.mensaje.length} / {MAX_MESSAGE_LENGTH} caracteres
            </span>
          </div>
          <div className="input-wrapper">
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              placeholder="Escribe tu consulta o mensaje aquí (máximo 300 caracteres)..."
              value={formData.mensaje}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={MAX_MESSAGE_LENGTH}
              className={`form-textarea ${
                touched.mensaje && errors.mensaje ? 'input-error' : ''
              } ${
                touched.mensaje && !errors.mensaje && formData.mensaje
                  ? 'input-valid'
                  : ''
              }`}
              aria-invalid={touched.mensaje && !!errors.mensaje}
              aria-describedby={
                touched.mensaje && errors.mensaje ? 'mensaje-error' : undefined
              }
              disabled={isSubmitting}
            />
          </div>
          {touched.mensaje && errors.mensaje && (
            <p id="mensaje-error" className="error-message">
              <span className="error-icon" aria-hidden="true">&#9888;</span>
              {errors.mensaje}
            </p>
          )}
        </div>

        {/* Botón de Envío con estado de Cooldown y Submitting */}
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || cooldown > 0}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              <span>Enviando mensaje...</span>
            </>
          ) : cooldown > 0 ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Espera ({cooldown}s)...</span>
            </>
          ) : (
            <>
              <span>Enviar Mensaje</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;
