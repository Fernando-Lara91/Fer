/**
 * INVITACIÓN BOHO — INTERACCIONES DEL NAVEGADOR
 * Funciones documentadas: apertura de carta, animaciones, contador, RSVP.
 * El contenido del evento se edita en config/evento.json, no aquí.
 */

// Esperamos a que el HTML esté cargado antes de buscar elementos de la página.
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // 1. CARTA CERRADA: la persona abre la invitación presionando el lacre.
  const overlay = document.getElementById("intro");
  const openButtons = [
    document.getElementById("open-invitation"),
    document.getElementById("open-invitation-text")
  ];
  let isOpening = false;

  // Algunos navegadores privados bloquean sessionStorage: la carta debe funcionar igual.
  function hasOpenedBefore() {
    try { return sessionStorage.getItem("boho-invitation-opened") === "yes"; }
    catch (_error) { return false; }
  }
  function rememberOpening() {
    try { sessionStorage.setItem("boho-invitation-opened", "yes"); }
    catch (_error) { /* Sin almacenamiento, se vuelve a mostrar al recargar. */ }
  }

  function finishOpening() {
    overlay.classList.add("opened");
    document.body.classList.remove("invitation-locked");
    rememberOpening();
    // El elemento inicial sale de la navegación de teclado cuando se oculta.
    window.setTimeout(() => { overlay.setAttribute("inert", ""); }, 950);
  }

  function openLetter() {
    if (isOpening) return;
    isOpening = true;
    overlay.classList.add("opening");
    // El sobre y la carta ejecutan su transición antes de dejar ver el sitio.
    window.setTimeout(finishOpening, 680);
  }

  openButtons.forEach((button) => button?.addEventListener("click", openLetter));

  // En una recarga de la misma pestaña no obligamos a abrir el sobre nuevamente.
  if (hasOpenedBefore()) {
    overlay.classList.add("opened");
    overlay.setAttribute("inert", "");
    document.body.classList.remove("invitation-locked");
  } else {
    document.getElementById("open-invitation")?.focus({ preventScroll: true });
  }

  // 2. ANIMACIONES DE ENTRADA: contenido visible aun si JS/observer falla.
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateReveal(element) {
    if (element.classList.contains("visible")) return;
    element.classList.add("visible");
    if (!reduceMotion && typeof element.animate === "function") {
      element.animate(
        [ { opacity: 0.3, transform: "translateY(22px)" }, { opacity: 1, transform: "translateY(0)" } ],
        { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)", fill: "none" }
      );
    }
  }

  // El observador ahorra recursos y el chequeo por scroll es un respaldo.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateReveal(entry.target);
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach((element) => observer.observe(element));
  }
  function checkVisibleOnScroll() {
    reveals.forEach((element) => {
      if (element.classList.contains("visible")) return;
      const rectangle = element.getBoundingClientRect();
      if (rectangle.top < window.innerHeight - 25 && rectangle.bottom > 0) animateReveal(element);
    });
  }
  window.addEventListener("scroll", checkVisibleOnScroll, { passive: true });
  window.addEventListener("resize", checkVisibleOnScroll);
  checkVisibleOnScroll();

  // 3. BARRA SUPERIOR: muestra cuánto se ha recorrido de la invitación.
  const progressBar = document.getElementById("reading-progress");
  let progressQueued = false;
  window.addEventListener("scroll", () => {
    if (progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(() => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const progress = available > 0 ? (window.scrollY / available) * 100 : 100;
      if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      progressQueued = false;
    });
  }, { passive: true });

  // 4. CUENTA REGRESIVA: toma la fecha desde el atributo del elemento <body>.
  const eventDate = new Date(document.body.dataset.eventDate);
  const countdownFields = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  function updateCountdown() {
    // Nunca mostramos valores negativos luego de la fecha del matrimonio.
    const remaining = Number.isNaN(eventDate.getTime()) ? 0 : Math.max(0, eventDate.getTime() - Date.now());
    const seconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(seconds / 86400),
      hours: Math.floor((seconds % 86400) / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60
    };
    Object.entries(values).forEach(([name, value]) => {
      if (countdownFields[name]) countdownFields[name].textContent = String(value).padStart(2, "0");
    });
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // 5. RSVP: si la persona no asiste, escondemos el selector de acompañantes.
  const rsvpForm = document.getElementById("rsvp-form");
  const countWrap = document.getElementById("guest-count-wrap");
  const countSelect = document.getElementById("guest-count");
  const feedback = document.getElementById("form-feedback");
  const options = rsvpForm?.querySelectorAll('input[name="asistira"]') || [];

  options.forEach((radio) => radio.addEventListener("change", () => {
    const attending = rsvpForm.querySelector('input[name="asistira"]:checked')?.value === "si";
    countWrap.hidden = !attending;
    if (!attending) countSelect.value = "1";
    feedback.textContent = "";
    feedback.className = "form-feedback";
  }));

  function showFeedback(message, type) {
    // role="status" del HTML hace que el lector de pantalla anuncie el mensaje.
    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
  }

  rsvpForm?.addEventListener("submit", async (event) => {
    event.preventDefault(); // Enviamos sin refrescar toda la carta.
    const form = new FormData(rsvpForm);
    const nombre = String(form.get("nombre") || "").trim();
    const asistira = String(form.get("asistira") || "");
    const correo = String(form.get("email") || "").trim();

    if (nombre.length < 2) {
      showFeedback("Por favor, escribe tu nombre completo.", "error");
      document.getElementById("guest-name")?.focus();
      return;
    }
    if (!asistira) {
      showFeedback("Selecciona si podrás acompañarnos.", "error");
      return;
    }
    if (correo && !document.getElementById("guest-email").checkValidity()) {
      showFeedback("El correo ingresado no parece válido.", "error");
      return;
    }

    const respuesta = [
      'Matrimonio de Isidora y Mateo',
      'Nombre: ' + nombre,
      'Asistencia: ' + (asistira === 'si' ? 'Sí' : 'No'),
      asistira === 'si' && 'Total de personas: ' + form.get('cantidad'),
      correo && 'Correo: ' + correo,
      form.get('cancion') && 'Canción: ' + form.get('cancion'),
      form.get('mensaje') && 'Mensaje: ' + form.get('mensaje')
    ].filter(Boolean).join('\n');
    window.location.assign('https://wa.me/?text=' + encodeURIComponent(respuesta));
  });
});
