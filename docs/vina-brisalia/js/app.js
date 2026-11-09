(() => {
  'use strict';
  const cfg = window.BRISALIA_CONFIG || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nombre de marca y rutas de fotografías editables desde config.js.
  if (cfg.nombre) {
    $$('[data-brand]').forEach(el => { el.textContent = cfg.nombre; });
    document.title = `${cfg.nombre} | Golf, viñedos y celebraciones`;
  }
  if (cfg.fotos) {
    $$('img[data-photo]').forEach(img => {
      const key = img.dataset.photo;
      if (cfg.fotos[key]) img.src = cfg.fotos[key];
    });
  }
  $('#current-year').textContent = new Date().getFullYear();

  // Menú responsive, con salida por Escape y cierre al seleccionar sección.
  const menuButton = $('#menu-toggle');
  const navigation = $('#main-nav');
  function closeMenu() {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  }
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('.main-nav a').forEach(a => a.addEventListener('click', closeMenu));

  // Estado visual del encabezado.
  const header = $('.site-header');
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 36);
  window.addEventListener('scroll', updateHeader, { passive: true }); updateHeader();

  // Aparición suave. Si no hay IntersectionObserver, todo permanece visible.
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.09, rootMargin: '0px 0px -25px 0px' });
    $$('.reveal').forEach(el => { el.classList.add('pending-reveal'); revealObserver.observe(el); });
  }

  // Filtros de galería.
  let visibleGallery = [];
  const galleryCards = $$('.gallery-photo');
  const filterButtons = $$('.filter-btn');
  function filterGallery(category) {
    filterButtons.forEach(btn => {
      const active = btn.dataset.filter === category;
      btn.classList.toggle('current', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    galleryCards.forEach(card => { card.hidden = category !== 'todas' && card.dataset.category !== category; });
    $('#gallery-grid').classList.toggle('filtered', category !== 'todas');
    visibleGallery = galleryCards.filter(card => !card.hidden);
  }
  filterButtons.forEach(btn => btn.addEventListener('click', () => filterGallery(btn.dataset.filter)));
  filterGallery('todas');

  // Modal nativo con soporte para Escape, clic exterior y flechas.
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-image');
  const lightboxCaption = $('#lightbox-caption');
  const lightboxCount = $('#lightbox-count');
  let currentGalleryIndex = 0;
  function showPhoto(index) {
    if (!visibleGallery.length) return;
    currentGalleryIndex = (index + visibleGallery.length) % visibleGallery.length;
    const card = visibleGallery[currentGalleryIndex];
    const sourceImg = card.querySelector('img');
    lightboxImg.src = sourceImg.currentSrc || sourceImg.src;
    lightboxImg.alt = sourceImg.alt;
    lightboxCaption.textContent = card.dataset.caption || sourceImg.alt;
    lightboxCount.textContent = `${currentGalleryIndex + 1} / ${visibleGallery.length}`;
  }
  galleryCards.forEach(card => card.addEventListener('click', () => {
    currentGalleryIndex = visibleGallery.indexOf(card);
    showPhoto(currentGalleryIndex);
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
  }));
  function closeLightbox() { if (lightbox.open && lightbox.close) lightbox.close(); else lightbox.removeAttribute('open'); }
  $('#lightbox-close').addEventListener('click', closeLightbox);
  $('#lightbox-prev').addEventListener('click', () => showPhoto(currentGalleryIndex - 1));
  $('#lightbox-next').addEventListener('click', () => showPhoto(currentGalleryIndex + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
    if (!lightbox.open) return;
    if (e.key === 'ArrowLeft') showPhoto(currentGalleryIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentGalleryIndex + 1);
  });

  // Los botones de tarjetas dejan seleccionado el tipo de evento.
  $$('[data-select-event]').forEach(a => a.addEventListener('click', () => {
    $('#tipo-evento').value = a.dataset.selectEvent;
  }));

  // En el sitio público, el visitante descarga una copia de su solicitud.
  const form = $('#quote-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const labels = {
      nombre: 'Nombre', email: 'Correo', telefono: 'Teléfono', evento: 'Evento',
      fecha: 'Fecha', invitados: 'Invitados', mensaje: 'Mensaje'
    };
    const lines = Object.entries(labels).map(([key, label]) => label + ': ' + fields.get(key));
    const file = new Blob(['Viña Brisalia · Solicitud de demostración\n\n', lines.join('\n')], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'solicitud-vina-brisalia.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    const feedback = $('#form-feedback');
    feedback.textContent = 'Tu copia está lista para descargar. Los datos se quedan en tu equipo.';
    feedback.hidden = false;
  });
})();
