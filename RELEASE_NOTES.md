# WhoDownloads v1.0.1

Patch release focused on more reliable YouTube downloads and clearer diagnostics when a format is not directly available.

## What's New

- MP4 downloads now prefer direct H.264/AAC streams, then fall back to the best available video/audio up to the requested quality.
- If a user asks for 1080p but the source video only has 720p, WhoDownloads now uses the best available resolution instead of failing only because 1080p is unavailable.
- MP4 output is converted to a broadly compatible H.264/AAC file when YouTube provides VP9/AV1 or another less compatible stream.
- Download logs in the Electron main console now show the selected format, requested quality, output folder, whether cookies are used, the yt-dlp format selector, stderr lines, exit code, and final normalized error.
- Error messages are clearer when no downloadable MP4 format is found or ffmpeg conversion fails.
- Fixed broken accent/separator text in visible Spanish messages.

## Patch Notes

- Keeps MP3 320 kbps behavior intact.
- Keeps YouTube cookie support, without logging the cookie file path.
- Keeps the existing UI flow and download manager behavior.
- Adds regression coverage for MP4 fallback selectors, 1080p fallback behavior, logging, and MP3 quality arguments.

## Installation

Download `WhoDownloads-Setup-1.0.1.exe` from the release assets and run the installer.

## Notes

- Windows only for now.
- If YouTube asks for verification, sign in from the embedded YouTube view inside the app and retry.
- MP4 fallback conversion can take longer than a direct download because ffmpeg may need to re-encode the video.
