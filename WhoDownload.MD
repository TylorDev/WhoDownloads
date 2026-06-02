# WhoDownloads PRD

## 1. Resumen del producto

WhoDownloads es una aplicacion desktop Electron para descargar videos y playlists de YouTube en formatos MP4 o MP3. El producto esta pensado para usuarios que quieren capturar contenido de YouTube sin depender de una experiencia web externa: pueden pegar una URL, arrastrarla, navegar YouTube dentro de la app, revisar metadata antes de descargar y controlar una cola de descargas.

La propuesta de valor actual es combinar tres modos de captura en una sola herramienta:

- Descarga directa de un video por URL.
- Descarga de playlists completas o recortadas.
- Captura de videos desde un navegador YouTube embebido y descarga por lotes.

La aplicacion esta construida con Electron, React, Vite y TypeScript. Usa `yt-dlp` y `ffmpeg` como binarios locales para resolver metadata, descargar, convertir y guardar archivos.

## 2. Objetivos

- Permitir descargar videos de YouTube en MP4 compatible o MP3 audio.
- Permitir configurar una carpeta de descarga, formato y calidad compartidos.
- Permitir descargar rapidamente cuando la configuracion fue confirmada.
- Permitir explorar playlists y convertirlas en una cola descargable.
- Permitir navegar YouTube dentro de la app y capturar videos visitados o clickeados.
- Mostrar progreso, errores, resultados y acceso a archivos descargados.
- Mantener una experiencia desktop segura, con IPC controlado y sin acceso Node directo en renderer.

## 3. Usuarios y casos de uso

### Usuarios objetivo

- Usuarios que descargan videos individuales de YouTube con frecuencia.
- Usuarios que organizan playlists y necesitan descargar varios videos en lote.
- Usuarios que prefieren navegar YouTube visualmente y armar una cola desde videos encontrados.
- Usuarios que alternan entre MP4 y MP3 y quieren una configuracion persistente.

### Casos de uso principales

- Pegar una URL de video y ver preview antes de descargar.
- Activar descarga rapida para saltarse preview y usar la configuracion confirmada.
- Elegir carpeta, formato y calidad desde Home o Settings con sincronizacion inmediata.
- Pegar o arrastrar una URL de playlist y cargarla automaticamente en la vista Playlist.
- Descargar todos o algunos videos de una playlist.
- Abrir YouTube dentro de la app, acumular videos detectados y descargarlos como lote.
- Revisar descargas activas, completadas o fallidas desde la vista Downloads.

## 4. Alcance actual

### Incluido

- Descarga de videos de YouTube por URL.
- Preview de metadata antes de descargar.
- Formatos `mp4` y `mp3`.
- Calidades `auto`, `1080`, `720`, `480` para MP4.
- Calidades `auto`, `320`, `192`, `128` para MP3.
- Carpeta de descarga configurable.
- Descarga rapida basada en settings confirmados.
- Descarga de playlists con control para listas largas.
- Cola de videos capturados desde YouTube embebido.
- Seguimiento de progreso y estados de descarga.
- Controles de ventana Electron frameless.

### No incluido en el alcance actual

- Login o cuentas de usuario.
- Persistencia de historial entre sesiones.
- Scheduler de descargas.
- Reintentos avanzados o politicas configurables de errores.
- Actualizaciones automaticas.
- Empaquetado multiplataforma completamente definido.

## 5. Flujos principales

### 5.1 Home: descarga individual

1. El usuario ingresa, pega o arrastra una URL de YouTube.
2. `UrlIntakeContext` clasifica URLs pegadas o arrastradas fuera de campos editables.
3. Si la URL es video, `DownloadContext` la coloca en Home.
4. Si descarga rapida esta desactivada, la app carga un preview de metadata con debounce.
5. El usuario revisa metadata, formato, calidad y carpeta.
6. El usuario inicia la descarga.
7. La app crea una tarea, escucha progreso y muestra estado en UI.
8. Al finalizar, la tarea queda visible en Downloads y puede revelarse en carpeta.

### 5.2 Descarga rapida

1. El usuario configura carpeta, formato y calidad.
2. El usuario confirma la configuracion de descarga rapida en Settings.
3. En Home, puede activar descarga rapida.
4. Al pegar o escribir una URL valida, la app descarga sin preview.
5. Si cambia carpeta, formato o calidad, `quickDownloadConfigured` vuelve a `false`.

### 5.3 Settings

1. `SettingsContext` carga settings desde IPC al montar.
2. El usuario elige carpeta, formato y calidad.
3. Cada cambio persiste mediante `window.whoDownloads.saveSettings`.
4. Home y Settings comparten la misma fuente de verdad.
5. El usuario confirma la configuracion para habilitar descarga rapida.

### 5.4 Playlist

1. El usuario ingresa una URL de playlist o pega/arrastra una URL global.
2. `NavigationContext` abre Playlist y puede almacenar una playlist pendiente.
3. `PlaylistContext` valida que la URL sea playlist de YouTube.
4. La app solicita entradas al proceso principal con `fetchPlaylist`.
5. Si la playlist es larga, la app ofrece cargar todo o los primeros 100.
6. El usuario puede eliminar entradas, descargar un video o descargar la lista.
7. `DownloadContext.downloadUrls` crea tareas y descarga en lotes.

### 5.5 YouTube embebido

1. El usuario abre la vista YouTube.
2. `YouTubeContext` solicita el preload del webview.
3. La app detecta videos por navegacion o eventos IPC del webview.
4. URLs normalizadas se deduplican en `clickedVideos`.
5. La UI muestra avisos para videos agregados o duplicados.
6. El usuario puede usar un video en Home, descargarlo rapido o descargar la cola completa.

### 5.6 Downloads

1. `DownloadContext` mantiene `downloadTasks`.
2. Las tareas se crean con estado `queued` o estados de progreso.
3. El renderer escucha `onDownloadProgress`.
4. La UI ordena tareas activas arriba.
5. Al completarse una descarga, la app permite mostrar el archivo en carpeta.

## 6. Arquitectura funcional

### 6.1 `DownloadContext`

Responsable de la experiencia de descarga:

- Mantiene URL actual, metadata, tareas, progreso y flags de descarga.
- Deriva `format` y `quality` desde `SettingsContext`.
- Cambia formato/calidad llamando a `updateFormat` y `updateQuality`.
- Ejecuta preview automatico cuando hay URL valida y no hay descarga rapida.
- Ejecuta descarga individual con `downloadVideo`.
- Ejecuta descarga por lotes con concurrencia limitada.
- Evita descargas simultaneas incompatibles mediante refs de estado activo.
- Navega a Downloads cuando inicia una descarga por lote.

### 6.2 `SettingsContext`

Fuente de verdad para configuracion persistente:

- Carga settings iniciales desde `getSettings`.
- Persiste cambios con `saveSettings`.
- Mantiene `downloadDirectory`, `defaultFormat`, `defaultQuality` y `quickDownloadConfigured`.
- Cambiar carpeta, formato o calidad invalida descarga rapida.
- Confirmar settings activa `quickDownloadConfigured`.
- Expone `chooseDirectory`, `updateFormat`, `updateQuality` y `confirmQuickDownloadSettings`.

### 6.3 `NavigationContext`

Controla navegacion de alto nivel:

- Mantiene `activePage`.
- Expone `setActivePage`.
- Maneja `pendingPlaylistUrl` para diferir carga de playlist hasta que la pagina lazy este montada.
- Expone `openPlaylistUrl` y `clearPendingPlaylistUrl`.

### 6.4 `PlaylistContext`

Responsable de carga y gestion de playlists:

- Mantiene URL, titulo, entradas, error y estado de carga.
- Valida URL de playlist antes de llamar IPC.
- Limpia resultados previos al iniciar nueva carga.
- Maneja playlists vacias o errores.
- Detecta playlists largas y crea `pendingLongPlaylist`.
- Permite cargar todo o solo las primeras 100 entradas.
- Permite remover entradas individuales.

### 6.5 `YouTubeContext`

Responsable del navegador YouTube embebido:

- Mantiene path de preload del webview.
- Mantiene `clickedVideos`.
- Mantiene notificacion de ultimo video valido detectado.
- Escucha eventos globales `onYouTubeVideoClicked`.
- Escucha eventos del webview: `ipc-message`, `did-navigate`, `did-navigate-in-page`.
- Normaliza URLs de video.
- Deduplica videos.
- Bloquea captura si hay descarga por lote activa.

### 6.6 `UrlIntakeContext`

Responsable de entrada global de URLs:

- Escucha `paste`, `dragover` y `drop`.
- Ignora eventos dentro de inputs, textareas, selects o elementos editables.
- Extrae URLs HTTP/HTTPS desde texto.
- Clasifica URLs como video o playlist.
- Rutea videos a Home.
- Rutea playlists a Playlist mediante `openPlaylistUrl`.
- Si descarga rapida esta activa, descarga videos automaticamente.

## 7. Interfaces y contratos

### 7.1 Preload: `window.whoDownloads`

La API expuesta al renderer incluye:

- `windowControls.minimize`
- `windowControls.toggleMaximize`
- `windowControls.close`
- `windowControls.isMaximized`
- `getYouTubeWebviewPreloadPath`
- `previewVideo`
- `downloadVideo`
- `fetchPlaylist`
- `getSettings`
- `saveSettings`
- `selectDownloadDirectory`
- `showItemInFolder`
- `openDownloadDirectory`
- `onYouTubeVideoClicked`
- `onDownloadProgress`

### 7.2 Tipos compartidos

Tipos principales:

- `DownloadInput`: URL, formato, calidad y `taskId` opcional.
- `DownloadTask`: tarea visible en UI con estado, progreso, metadata y resultado.
- `DownloadProgress`: actualizacion de progreso enviada desde main.
- `AppSettings`: carpeta, formato, calidad y bandera de descarga rapida.
- `MetadataResult`, `DownloadResult`, `PlaylistResult`, `SettingsResult`: resultados `ok/error`.

### 7.3 IPC principal

Canales funcionales:

- `preview-video`: obtiene metadata con `yt-dlp`.
- `download-video`: descarga y emite progreso.
- `fetch-playlist`: obtiene entradas de playlist.
- `get-settings` y `save-settings`: persistencia.
- `select-download-directory`: selector nativo de carpeta.
- `show-item-in-folder` y `open-download-directory`: integracion con shell.
- `get-youtube-webview-preload-path`: soporte para webview.
- `window-*`: controles de ventana.

## 8. Requisitos funcionales

- El usuario puede ingresar una URL de YouTube y recibir validacion visible.
- El usuario puede ver metadata antes de descargar cuando descarga rapida esta desactivada.
- El usuario puede seleccionar formato y calidad compartidos entre Home y Settings.
- El usuario puede elegir carpeta desde Home o Settings.
- La app debe invalidar descarga rapida cuando cambia la configuracion base.
- La app debe prevenir descargas incompatibles mientras hay una descarga activa.
- La app debe permitir hasta 4 descargas paralelas desde lotes.
- La app debe mostrar estados `starting`, `downloading`, `processing`, `completed` y `failed`.
- La app debe permitir cargar playlists y manejar listas largas.
- La app debe capturar videos desde el navegador YouTube embebido sin duplicarlos.
- La app debe permitir mostrar archivos descargados en carpeta.

## 9. Requisitos no funcionales

### Seguridad

- `contextIsolation` debe permanecer activo.
- `nodeIntegration` debe permanecer desactivado.
- `sandbox` debe permanecer activo.
- El renderer solo debe acceder a capacidades nativas mediante preload.
- IPC debe validar entradas antes de ejecutar acciones.

### Rendimiento

- Home debe ser la vista inicial.
- Vistas no iniciales deben poder cargarse de forma diferida.
- El proceso principal debe diferir servicios pesados hasta que se invoquen.
- La ventana no debe mostrar un flash blanco antes de que el renderer este listo.
- El webview de YouTube solo debe inicializar su preload al entrar a la vista YouTube.

### Robustez

- Cancelaciones de dialogo de carpeta no deben tratarse como errores.
- Errores de `yt-dlp`, playlist o settings deben mostrarse al usuario.
- La app debe limpiar timers/listeners en efectos React.
- El progreso de lotes no debe sobrescribir indebidamente progreso individual.

## 10. Metricas y criterios de aceptacion

- Una URL valida de video muestra preview y permite descargar.
- Una URL invalida muestra error y no inicia descarga.
- Descarga rapida solo se puede activar con settings confirmados.
- Cambiar carpeta, formato o calidad desconfigura descarga rapida.
- Home y Settings muestran siempre la misma carpeta, formato y calidad.
- Una playlist larga permite elegir cargar todo o primeros 100 videos.
- La vista YouTube deduplica videos detectados.
- La cola de YouTube puede descargarse como lote.
- Downloads muestra tareas activas, completadas y fallidas.
- `npm test` pasa.
- `npm run build` pasa.

## 11. Riesgos y consideraciones

- YouTube puede cambiar HTML, navegacion o restricciones, afectando deteccion y `yt-dlp`.
- `yt-dlp` y `ffmpeg` son dependencias externas locales; su ausencia o incompatibilidad bloquea descargas.
- Las descargas por lote pueden consumir CPU, red y disco de forma intensa.
- La persistencia de settings es optimista: la UI actualiza antes de confirmar guardado exitoso.
- No hay historial persistido de descargas entre sesiones.
- El soporte multiplataforma depende de binarios y empaquetado por sistema operativo.

## 12. Fuera de alcance actual / Futuro

- Login o integracion con cuentas de YouTube.
- Scheduler o descargas programadas.
- Auto-update.
- Historial persistente y busqueda de descargas pasadas.
- Reintentos configurables por descarga.
- Priorizacion avanzada de cola.
- Soporte formal para multiples plataformas empaquetadas.
- Preferencias avanzadas de `yt-dlp`.
- Gestion avanzada de errores, diagnosticos y telemetria.
- Pruebas end-to-end automatizadas sobre Electron.
