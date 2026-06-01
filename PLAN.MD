@# Plan Para Downloader YouTube Electron + TS + shadcn

## Resumen

Crear una app desktop local, no SaaS, para descargar video/audio desde URLs de YouTube usando `yt-dlp` y `ffmpeg`, sin YouTube Data API oficial. El MVP debe enfocarse en descargas personales de contenido que el usuario tenga derecho a descargar.

## Stack Recomendado

- `Electron + electron-vite`: base desktop con main, preload y renderer separados; buen HMR y soporte React/TS.
- `React + TypeScript + Vite`: UI rápida, tipado fuerte y ecosistema maduro.
- `shadcn/ui + Tailwind CSS + lucide-react`: componentes limpios, personalizables y consistentes.
- `yt-dlp`: motor principal para extracción, formatos, playlists, metadatos, thumbnails y descarga sin API oficial.
- `ffmpeg + ffprobe`: conversión, muxing, extracción de audio, thumbnails embebidos y validación de metadatos.
- `execa`: ejecutar `yt-dlp`/`ffmpeg` desde el proceso main con control de stdout/stderr.
- `zod`: validar inputs, preferencias, jobs y mensajes IPC.
- React Context: estado simple para cola, progreso y preferencias.
- `better-sqlite3 + drizzle`: historial local, configuración, cola persistente y archivos descargados.
- `electron-builder`: empaquetado para Windows/macOS/Linux con binarios incluidos.

## Arquitectura

- Renderer: React + shadcn para formulario de URL, selector de formato, cola, progreso, historial y configuración.
- Preload: API segura vía `contextBridge`; nada de Node directo en renderer.
- Main process: orquesta jobs, ejecuta `yt-dlp`, maneja paths, permisos, base de datos y eventos de progreso.
- Worker/download service: capa aislada que convierte opciones de UI en comandos seguros para `yt-dlp`.
- Storage local: SQLite para historial, estado de jobs, rutas, preferencias, formatos favoritos y errores.
- Binarios: incluir `yt-dlp` y `ffmpeg` como recursos externos versionados, o permitir ruta custom avanzada.

## Funciones MVP

- Pegar URL de video o playlist.
- Obtener metadata previa sin descargar: título, canal, duración, thumbnail, fecha, descripción corta y formatos disponibles.
- Descargar video como `mp4` preferente: mejor video + mejor audio compatible.
- Descargar audio como `m4a` por defecto y `mp3` opcional.
- Embed de metadatos y thumbnail cuando el contenedor lo soporte.
- Cola con progreso por archivo, velocidad, ETA, estado, cancelar y reintentar.
- Plantillas de nombre: `%(uploader)s/%(title)s [%(id)s].%(ext)s`.
- Historial local con abrir carpeta, copiar URL y borrar entrada del historial.
- Configuración: carpeta destino, formato default, calidad, concurrencia, idioma de subtítulos y conservar `.info.json`.

## Decisiones Técnicas Clave

- Usar `yt-dlp --dump-json` para preview de metadata y `--embed-metadata`, `--embed-thumbnail`, `--write-info-json` para descargas.
- No usar scraping propio del HTML de YouTube; delegar compatibilidad a `yt-dlp`.
- No soportar login/cookies en MVP para reducir riesgo legal, de seguridad y soporte.
- No descargar DRM, contenido privado, contenido con bypass de restricciones ni contenido que requiera evasión.
- Manejar progreso parseando stdout de `yt-dlp` y emitiendo eventos IPC tipados.
- Sanitizar nombres de archivo y bloquear rutas fuera de la carpeta destino.
- Guardar logs técnicos por job para depuración, sin guardar credenciales.

## Plan De Implementación

1. Scaffold con `electron-vite` usando React + TypeScript.
2. Instalar y configurar shadcn/ui para Vite.
3. Crear estructura `main`, `preload`, `renderer` y contratos IPC con `zod`.
4. Implementar servicio `MetadataService` usando `yt-dlp --dump-json`.
5. Implementar servicio `DownloadService` con cola, cancelación y progreso.
6. Añadir SQLite para historial, settings y estado persistente.
7. Construir UI: input URL, preview, selector de formato, cola, historial y settings.
8. Integrar `ffmpeg/ffprobe` y validar embed de metadata/thumbnails.
9. Empaquetar con `electron-builder`, incluyendo binarios o rutas configurables.
10. Añadir pruebas unitarias de parsing, validación IPC, naming y comandos generados.

## Tests Y Criterios De Aceptación

- Preview devuelve metadata válida para una URL pública.
- Descarga audio `m4a` con título, artista/canal, fecha y thumbnail cuando sea posible.
- Descarga video `mp4` reproducible con audio/video sincronizados.
- Cancelar un job detiene el proceso y marca estado correctamente.
- Reintentar un job fallido no duplica entradas corruptas.
- La app no permite escribir fuera del directorio destino.
- El renderer no tiene acceso directo a Node.
- Build empaquetado abre y ejecuta descargas en Windows.

## Riesgos Y Mitigaciones

- YouTube cambia con frecuencia: mantener `yt-dlp` actualizable desde settings o release interno.
- Riesgo legal/TOS: incluir aviso de uso responsable y limitar MVP a URLs proporcionadas por el usuario.
- Antivirus puede marcar binarios: firmar builds y documentar origen de `yt-dlp`/`ffmpeg`.
- Metadatos varían por formato: validar con `ffprobe` y mostrar advertencias cuando un contenedor no soporte ciertos tags.

## Referencias

- [electron-vite Getting Started](https://electron-vite.github.io/guide/getting-started)
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite)
- [yt-dlp README](https://github.com/yt-dlp/yt-dlp/blob/master/README.md)
- [electron-builder Docs](https://www.electron.build/docs/)
- [YouTube Terms of Service](https://www.youtube.com/t/terms)
