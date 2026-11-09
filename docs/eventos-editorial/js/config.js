/*
 * CONFIGURACION PRINCIPAL DEL SITIO
 * 1. Edita nombre y sigla de la marca.
 * 2. Copia fotos JPG/PNG/WebP a web/assets/fotos/.
 * 3. Cambia las rutas a continuación, por ejemplo: "assets/fotos/mi-foto.jpg".
 * 4. Guarda y recarga el navegador. No necesitas reiniciar Python.
 */
window.PROYECTO_CONFIG = {
  nombre: "Tu espacio",              // Nombre que aparece en portada, cabecera y pie
  iniciales: "TE",                 // Se muestran mientras no exista un logo real
  logo: "",                        // Opcional: "assets/fotos/logo.png"
  fotos: {
    portada: "assets/fotos/portada-persona.svg",
    entorno: "assets/fotos/galeria-entorno.svg",
    celebracion: "assets/fotos/galeria-celebracion.svg",
    recinto: "assets/fotos/galeria-recinto.svg",
    detalles: "assets/fotos/galeria-detalles.svg"
  }
};
