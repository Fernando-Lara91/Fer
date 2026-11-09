"""Servidor local de desarrollo para Jardín de Olivos."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000, help="Puerto local")
    args = parser.parse_args()
    public = Path(__file__).resolve().parent / "docs"
    handler = partial(SimpleHTTPRequestHandler, directory=str(public))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as error:
        parser.exit(1, f"No se pudo iniciar el servidor en el puerto {args.port}. "
                       f"Prueba con --port 8080.\n{error}\n")
    with server:
        print(f"Abre http://127.0.0.1:{server.server_port} en tu navegador. "
              "Pulsa Ctrl+C para salir.", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
