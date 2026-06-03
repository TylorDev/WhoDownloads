# Windows binaries

Place the MVP runtime binaries here:

- `yt-dlp.exe`
- `ffmpeg.exe`
- `node/node.exe`

During development the app resolves these files from `resources/bin/win`.
Packaged builds should copy this folder to Electron's resources directory as `bin/win`.
Run `npm run prepare:node` before packaging to download the portable Node runtime.
