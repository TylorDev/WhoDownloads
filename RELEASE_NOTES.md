# WhoDownloads v1.0.0

First official release of WhoDownloads — a Windows desktop app to download YouTube videos and playlists as MP4 or MP3.

## ✨ Features

### Video Downloads
- Paste, type, or drag a YouTube URL to download a video
- Preview video metadata (title, thumbnail, duration) before downloading
- Choose between **MP4** video or **MP3** audio formats
- Select quality: `auto`, `1080p`, `720p`, `480p` for MP4 — `auto`, `320kbps`, `192kbps`, `128kbps` for MP3
- Choose a custom download folder or use the default (`Downloads/WhoDownloads`)

### Quick Download
- Configure your preferred folder, format, and quality in Settings
- Enable Quick Download to skip the preview step and download instantly on URL paste

### Playlist Support
- Paste a YouTube playlist URL to load and preview all videos
- Remove videos you don't need before downloading
- Download individual videos or the entire playlist
- Smart handling for large playlists: option to load only the first 100 entries

### Embedded YouTube Browser
- Browse YouTube directly inside the app
- Videos you visit are automatically detected and added to a download queue
- Download a single video from the queue or batch download all of them
- Sign in to YouTube from this view if anti-bot verification is required

### Download Manager
- Track active, completed, and failed downloads in real time
- Progress indicators for each download task
- Open the containing folder for any completed download

## 🏗️ Built With
- Electron + React + Vite + TypeScript
- yt-dlp and ffmpeg (bundled as local binaries)
- Secure architecture: context isolation, sandbox enabled, no Node.js access in renderer

## 📦 Installation

Download `WhoDownloads-Setup-1.0.0.exe` from the assets below and run the installer.

## ⚠️ Notes
- Windows only for now
- No automatic updates — check this page for new releases
- If YouTube asks for verification, sign in from the embedded YouTube view inside the app
