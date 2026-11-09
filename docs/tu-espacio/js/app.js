(() => {
  'use strict';
  const config = window.PROYECTO_CONFIG || {};

  // MARCA: modifica únicamente "config.js" para cambiar el nombre en 3 lugares.
  const nombre = (config.nombre || 'Tu espacio').trim();
  document.title = nombre + ' | Sitio editorial de eventos';
  document.querySelectorAll('[data-site-nombre]').forEach(el => { el.textContent = nombre; });
  document.querySelectorAll('[data-site-iniciales]').forEach(el => { el.textContent = (config.iniciales || 'TE').trim(); });
  const logo = document.querySelector('#logo-oficial');
  const monograma = document.querySelector('.brand-mark');
  if (config.logo) {
    logo.src = config.logo;
    logo.hidden = false;
    monograma.hidden = true;
    logo.onerror = () => { logo.hidden = true; monograma.hidden = false; };
  }

  // FOTOGRAFIAS: sustituye las rutas por fotos reales en config.js.
  const photos = [
    ['#imagen-portada', config.fotos?.portada],
    ['#galeria-entorno', config.fotos?.entorno],
    ['#galeria-celebracion', config.fotos?.celebracion],
    ['#galeria-recinto', config.fotos?.recinto],
    ['#galeria-detalles', config.fotos?.detalles]
  ];
  photos.forEach(([selector, ruta]) => {
    if (!ruta) return;
    const imagen = document.querySelector(selector);
    if (!imagen) return;
    imagen.src = ruta;
    const contenedor = imagen.closest('.hero-photo, .gallery-item');
    if (!/\.svg(?:[?#].*)?$/i.test(ruta)) contenedor?.classList.add('has-real-photo');
    imagen.onerror = () => {
      // Si el archivo no existe, queda el marcador de posición decorativo.
      imagen.style.display = 'none';
      contenedor?.classList.remove('has-real-photo');
      console.warn('Falta fotografía:', ruta);
    };
  });

  // MENU RESPONSIVE.
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  function cerrarMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menú');
  }
  menu.addEventListener('click', () => {
    const abierto = !nav.classList.contains('open');
    nav.classList.toggle('open', abierto);
    menu.setAttribute('aria-expanded', String(abierto));
    menu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

  // VOLVER ARRIBA.
  const backTop = document.querySelector('#back-top');
  const actualizarBoton = () => backTop.classList.toggle('visible', scrollY > 650);
  document.addEventListener('scroll', actualizarBoton, { passive: true });
  actualizarBoton();

  // FILTROS DE GALERIA.
  const botonesFiltro = [...document.querySelectorAll('.filter-btn')];
  const fotosGaleria = [...document.querySelectorAll('.gallery-item')];
  const galeria = document.querySelector('#gallery-grid');
  botonesFiltro.forEach(boton => boton.addEventListener('click', () => {
    const categoria = boton.dataset.filter;
    botonesFiltro.forEach(b => b.setAttribute('aria-pressed', String(b === boton)));
    fotosGaleria.forEach(item => { item.hidden = categoria !== 'todos' && item.dataset.category !== categoria; });
    galeria.classList.toggle('filtered', categoria !== 'todos');
  }));

  // CADA TARJETA DE SERVICIO PRESELECCIONA UNA CATEGORIA EN EL FORMULARIO.
  document.querySelectorAll('.service-link').forEach(link => link.addEventListener('click', () => {
    document.querySelector('#event').value = link.dataset.service;
  }));

  // Prepara una copia de la solicitud en el navegador.
  const form = document.querySelector('#quote-form');
  const summary = document.querySelector('#form-message');
  const preview = document.querySelector('#quote-preview');
  const copyBtn = document.querySelector('#copy-btn');
  const toast = document.querySelector('#toast');
  let toastTimeout;
  function avisar(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3400);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const datos = {
      nombre: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      evento: String(formData.get('event') || ''),
      fecha: String(formData.get('date') || ''),
      mensaje: String(formData.get('message') || '').trim()
    };
    const fecha = datos.fecha ? new Date(datos.fecha+'T12:00:00').toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' }) : 'Por definir';
    preview.textContent = `Nombre: ${datos.nombre}\nCorreo: ${datos.email}\nTipo de evento: ${datos.evento}\nFecha estimada: ${fecha}\nMensaje: ${datos.mensaje || 'Sin comentarios adicionales'}`;
    summary.classList.add('show');
    summary.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'nearest' });
    avisar('Tu solicitud está lista para copiar.');
  });
  copyBtn.addEventListener('click', async () => {
    const contenido = preview.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contenido);
      } else {
        const temporal = document.createElement('textarea');
        temporal.value = contenido;
        temporal.style.position = 'fixed'; temporal.style.opacity = '0';
        document.body.appendChild(temporal); temporal.select();
        if (!document.execCommand('copy')) throw new Error('No se puede copiar');
        temporal.remove();
      }
      avisar('Solicitud copiada.');
    } catch { avisar('Selecciona el texto para copiarlo manualmente.'); }
  });
})();
