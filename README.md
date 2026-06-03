# WhoDownloads

<p align="center">
  <img src="resources/bin/win/logo.svg" alt="WhoDownloads logo" width="220" />
</p>
<p align="center">
  <a href="https://www.electronjs.org/">
    <img src="https://skillicons.dev/icons?i=electron,react,ts,vite,sass,vitest,nodejs,npm&theme=dark" alt="Electron, React, TypeScript, Vite, Sass, Vitest, Node.js and npm" />
  </a>
</p>

WhoDownloads is a Windows desktop app built with Electron. It helps you download YouTube videos and playlists as MP4 or MP3 from a simple interface: paste a URL, review the video information, choose the format and save the file.

It also includes an embedded YouTube view so you can browse inside the app, detect videos, and add them to a download queue.

## Responsibility Notice

WhoDownloads is intended for personal use. Each user is responsible for respecting copyright, YouTube's terms, and any laws that apply to downloaded or stored content.

You do not need to sign in to YouTube to start using the app. You can paste a public URL and download normally when YouTube allows it. In some cases, YouTube may ask you to verify that you are not a bot; if that happens, open the YouTube view inside WhoDownloads, sign in, and try the download again.

## What You Can Do

- Download YouTube videos as MP4.
- Download audio as MP3.
- Download full playlists or selected videos.
- Paste, type, or drag YouTube URLs into the app.
- Choose the download folder, format, and quality.
- Enable quick download after confirming your settings.
- Browse YouTube inside the app and save detected videos.
- See active, completed, and failed download progress.
- Open the folder where a downloaded file was saved.

By default, downloads are saved in:

```text
Downloads/WhoDownloads
```

You can change this folder from the app.

## Windows Installation

If you only want to use the app, you do not need Node.js or development tools.

1. Go to the `dist` folder.
2. Run the installer:

```text
dist/WhoDownloads-Setup-1.0.1.exe
```

3. Follow the installer steps.
4. Open WhoDownloads from the desktop shortcut or the Start menu.

The installer includes the binaries needed to download and convert videos:

```text
resources/bin/win/yt-dlp.exe
resources/bin/win/ffmpeg.exe
resources/bin/win/node/node.exe
```

## Development Setup

Use these steps if you want to clone the project, modify it, or run it from source.

### Requirements

- Windows.
- Node.js.
- npm.
- Git.

### Clone The Project

```bash
git clone https://github.com/TylorDev/WhoDownloads.git
cd WhoDownloads
```

### Install Dependencies

```bash
npm install
```

### Check Local Binaries

During development, the app looks for these files:

```text
resources/bin/win/yt-dlp.exe
resources/bin/win/ffmpeg.exe
resources/bin/win/node/node.exe
```

If Node is missing, run:

```bash
npm run prepare:node
```

If `yt-dlp.exe` or `ffmpeg.exe` are missing, add them to that folder before testing real downloads.

### Run The App In Development

```bash
npm run dev
```

This opens the Electron app with Vite.

### Run In Debug Mode

```bash
npm run dev:debug
```

This enables Electron's remote debugging port.

### Show Console Logs

Run the app from cmd or PowerShell with `--logs` to print detailed startup, renderer, and download logs in that terminal:

```text
WhoDownloads.exe --logs
```

In development:

```bash
npm run dev -- --logs
```

Opening the app from a shortcut or double-click may not show a console even when `--logs` is present.

## Useful Commands

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Build the app:

```bash
npm run build
```

Create an unpacked Windows build:

```bash
npm run pack:win
```

Create the Windows installer:

```bash
npm run dist:win
```

Both packaging commands run `npm run prepare:node` first so the installer includes the portable Node runtime used by `yt-dlp`.

The generated installer is written to the `dist` folder.

## How To Use The App

### Download A Video

1. Open WhoDownloads.
2. Paste a YouTube URL on Home.
3. Wait for the video preview.
4. Choose MP4 or MP3.
5. Choose the quality.
6. Confirm the download folder.
7. Press the download button.

### Quick Download

1. Open Settings.
2. Choose the folder, format, and quality.
3. Confirm the settings.
4. Go back to Home and enable quick download.
5. Paste a valid YouTube URL.

When you change the folder, format, or quality, quick download is disabled until you confirm the settings again.

### Download A Playlist

1. Open the Playlist view.
2. Paste a YouTube playlist URL.
3. Load the playlist.
4. Remove any videos you do not want to download.
5. Download one video or the full list.

If the playlist is very long, the app may offer to load only the first 100 videos or load the full playlist.

### Use YouTube Inside The App

1. Open the YouTube view.
2. Browse inside the embedded browser.
3. When you open videos, the app adds them to a queue.
4. Download one video from the queue or download all of them.

You can use the app without signing in. If YouTube asks you to verify that you are not a bot, sign in from this view and try the download again.

## Common Issues

### Missing `yt-dlp.exe`

If you see an error like:

```text
No se encontro resources/bin/win/yt-dlp.exe
```

add `yt-dlp.exe` to:

```text
resources/bin/win
```

### Missing `ffmpeg.exe`

If MP3 or MP4 conversion fails, check that this file exists:

```text
resources/bin/win/ffmpeg.exe
```

### Missing `node.exe`

If previews show `Signature solving failed` or `n challenge solving failed`, make sure the portable runtime exists:

```text
resources/bin/win/node/node.exe
```

Run `npm run prepare:node` before packaging the app.

### YouTube Asks You To Verify Your Session

You do not need to sign in from the first use. But if an anti-bot verification message appears, open the YouTube view inside WhoDownloads, sign in, and try again.

The app stores that session in the embedded browser and can pass those cookies to `yt-dlp` to help with the download.

### Files Are Not Saved

Check that the download folder exists and that Windows allows writing to it. You can change the folder from Home or Settings.

### A Playlist Takes Too Long

Large playlists can use more network, CPU, and disk resources. If the app offers to load only the first 100 videos, use that option when you do not need the full list.

## Technology

WhoDownloads is built with:

- Electron.
- React.
- Vite.
- TypeScript.
- Vitest.
- yt-dlp.
- ffmpeg.

The app keeps native access controlled through Electron preload and IPC. The renderer does not use direct Node.js access.

## Current Status

The project is mainly focused on Windows. Formal multiplatform packaging is not defined yet.

Not included for now:

- App-owned user accounts.
- Persistent download history between sessions.
- Automatic updates.
- Scheduled downloads.
- Advanced configurable retries.
