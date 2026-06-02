# WhoDownloads

WhoDownloads es una aplicacion de escritorio para Windows hecha con Electron. Sirve para descargar videos y playlists de YouTube en formato MP4 o MP3 desde una interfaz simple: pegas una URL, revisas la informacion del video y eliges donde guardar el archivo.

Tambien incluye una vista de YouTube dentro de la app para navegar, detectar videos y agregarlos a una cola de descarga.

## Aviso de responsabilidad

WhoDownloads es una herramienta para uso personal. Cada usuario es responsable de respetar los derechos de autor, los terminos de YouTube y las leyes aplicables al descargar o conservar contenido.

No necesitas iniciar sesion en YouTube para empezar a usar la app. Puedes pegar una URL publica y descargar normalmente cuando YouTube lo permite. En algunos casos, YouTube puede pedir verificar que no eres un bot; si eso ocurre, abre la vista YouTube dentro de WhoDownloads, inicia sesion y vuelve a intentar la descarga.

## Que puedes hacer

- Descargar videos de YouTube en MP4.
- Descargar audio en MP3.
- Descargar playlists completas o solo algunos videos.
- Pegar, escribir o arrastrar URLs de YouTube.
- Elegir carpeta de descarga, formato y calidad.
- Activar descarga rapida cuando ya confirmaste tu configuracion.
- Navegar YouTube dentro de la app y guardar videos detectados.
- Ver el progreso de descargas activas, completadas o fallidas.
- Abrir la carpeta donde se guardo un archivo descargado.

Por defecto, las descargas se guardan en:

```text
Downloads/WhoDownloads
```

Puedes cambiar esa carpeta desde la app.

## Instalacion en Windows

Si solo quieres usar la app, no necesitas instalar Node.js ni herramientas de desarrollo.

1. Ve a la carpeta `dist`.
2. Ejecuta el instalador:

```text
dist/WhoDownloads-Setup-0.0.1.exe
```

3. Sigue los pasos del instalador.
4. Abre WhoDownloads desde el acceso directo del escritorio o desde el menu de inicio.

El instalador incluye los binarios necesarios para descargar y convertir videos:

```text
resources/bin/win/yt-dlp.exe
resources/bin/win/ffmpeg.exe
```

## Entorno de desarrollo

Usa estos pasos si quieres clonar el proyecto, modificarlo o ejecutarlo desde codigo fuente.

### Requisitos

- Windows.
- Node.js instalado.
- npm instalado.
- Git instalado.

### Clonar el proyecto

```bash
git clone https://github.com/TylorDev/WhoDownloads.git
cd WhoDownloads
```

### Instalar dependencias

```bash
npm install
```

### Revisar binarios locales

Durante desarrollo, la app busca estos archivos:

```text
resources/bin/win/yt-dlp.exe
resources/bin/win/ffmpeg.exe
```

Si faltan, las descargas no funcionaran. Agregalos en esa carpeta antes de probar descargas reales.

### Ejecutar la app en desarrollo

```bash
npm run dev
```

Este comando abre la app Electron con Vite.

### Ejecutar en modo debug

```bash
npm run dev:debug
```

Este modo habilita el puerto de depuracion remota de Electron.

## Comandos utiles

Ejecutar pruebas:

```bash
npm test
```

Ejecutar pruebas en modo watch:

```bash
npm run test:watch
```

Compilar la app:

```bash
npm run build
```

Crear una version Windows sin instalador:

```bash
npm run pack:win
```

Crear el instalador Windows:

```bash
npm run dist:win
```

El instalador generado queda en la carpeta `dist`.

## Como usar la app

### Descargar un video

1. Abre WhoDownloads.
2. Pega una URL de YouTube en Home.
3. Espera la vista previa del video.
4. Elige MP4 o MP3.
5. Elige la calidad.
6. Confirma la carpeta de descarga.
7. Presiona el boton de descarga.

### Descargar rapido

1. Abre Settings.
2. Elige carpeta, formato y calidad.
3. Confirma la configuracion.
4. Vuelve a Home y activa descarga rapida.
5. Pega una URL valida de YouTube.

Cuando cambias la carpeta, el formato o la calidad, la descarga rapida se desactiva hasta que confirmes la configuracion de nuevo.

### Descargar una playlist

1. Abre la vista Playlist.
2. Pega una URL de playlist de YouTube.
3. Carga la playlist.
4. Quita los videos que no quieras descargar.
5. Descarga un video individual o toda la lista.

Si la playlist es muy larga, la app puede ofrecer cargar solo los primeros 100 videos o cargarla completa.

### Usar YouTube dentro de la app

1. Abre la vista YouTube.
2. Navega dentro del navegador embebido.
3. Cuando entres a videos, la app los agrega a una cola.
4. Descarga un video desde la cola o descarga todos.

Puedes usar la app sin iniciar sesion. Si YouTube pide verificar que no eres un bot, inicia sesion en esta vista y vuelve a intentar la descarga.

## Problemas comunes

### Falta `yt-dlp.exe`

Si ves un error como:

```text
No se encontro resources/bin/win/yt-dlp.exe
```

agrega `yt-dlp.exe` en:

```text
resources/bin/win
```

### Falta `ffmpeg.exe`

Si la conversion a MP3 o MP4 falla, revisa que exista:

```text
resources/bin/win/ffmpeg.exe
```

### YouTube pide verificar la sesion

No es necesario iniciar sesion desde el primer uso. Pero si aparece un mensaje de verificacion anti-bot, abre la vista YouTube dentro de WhoDownloads, inicia sesion y vuelve a intentar.

La app guarda esa sesion en el navegador embebido y puede pasar esas cookies a `yt-dlp` para ayudar con la descarga.

### No se guardan archivos

Revisa que la carpeta de descarga exista y que Windows permita escribir en ella. Puedes cambiar la carpeta desde Home o Settings.

### Una playlist tarda mucho

Las playlists grandes pueden consumir mas red, CPU y disco. Si la app ofrece cargar solo los primeros 100 videos, usa esa opcion si no necesitas la lista completa.

## Tecnologia

WhoDownloads esta construido con:

- Electron.
- React.
- Vite.
- TypeScript.
- Vitest.
- yt-dlp.
- ffmpeg.

La app mantiene el acceso nativo controlado mediante preload e IPC de Electron. El renderer no usa acceso directo a Node.js.

## Estado actual

El proyecto esta enfocado principalmente en Windows. El empaquetado multiplataforma formal no esta definido todavia.

No incluye por ahora:

- Cuentas de usuario propias.
- Historial persistente de descargas entre sesiones.
- Actualizaciones automaticas.
- Scheduler de descargas.
- Reintentos avanzados configurables.
