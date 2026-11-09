# Jardín de Olivos

Prototipo de un centro de eventos en Talca. Las fotografías, el logotipo y los datos de contacto están pendientes. El formulario es demostrativo.

## Ejecutar en Visual Studio Code

1. Descomprime el ZIP y abre la carpeta `jardin-de-olivos` desde **Archivo → Abrir carpeta**.
2. Con Python 3.8 o superior instalado, abre **Terminal → Nuevo terminal** y ejecuta:

   ```sh
   python app.py
   ```

3. Abre **http://127.0.0.1:8000**. Si el puerto está ocupado, ejecuta `python app.py --port 8080` y abre el enlace que imprime la terminal.
4. Para editar el diseño o el contenido, modifica `docs/jardin-de-olivos/index.html`, guarda y actualiza el navegador. Para detener el servidor, pulsa **Ctrl+C**.

El servidor utiliza la biblioteca estándar de Python. En macOS o Linux puede que el comando sea `python3 app.py`.

## Subir el código a GitHub

Instala Git e inicia sesión en GitHub. Crea un repositorio vacío con la visibilidad que prefieras. En la terminal de VS Code, dentro de la carpeta que contiene `app.py`, ejecuta:

```sh
git init
git add .
git commit -m "Agrega el prototipo Jardín de Olivos"
git branch -M main
```

Sustituye `TU_USUARIO/TU_REPOSITORIO` por el propietario y el nombre de tu repositorio:

```sh
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

## Publicar y compartir la página

Con GitHub Free, usa un repositorio público. Abre el repositorio y entra en **Settings → Pages**. Elige **Deploy from a branch**, selecciona **main** y **/docs**, y pulsa **Save**. Cuando termine la publicación, abre **Visit site** y copia la URL para enviarla. Puedes apagar el servidor local.

Para actualizar la página, edita `docs/jardin-de-olivos/index.html` y sube los cambios a la rama `main`.
