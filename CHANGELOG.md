# Changelog

## v1.1.0 - 2026-06-03

- Bundled and forced a portable Node.js runtime for yt-dlp JavaScript challenge solving, fixing missing YouTube formats for standard Windows users.
- Added `--js-runtimes node:<embedded node.exe>` to preview, playlist, download, and diagnostic yt-dlp calls.
- Added preview safeguards: 25 second metadata timeout, AbortSignal support, process kill on timeout/abort, and stale renderer result protection.
- Added lightweight preview preflight checks for yt-dlp.exe and node.exe.
- Added more useful `--logs` output for preview spawn, timeout, abort, stderr, and exit events without exposing cookie file paths.
- Regenerated the Windows installer with the embedded Node runtime.

## v1.0.1 - 2026-06-03

- Improved MP4 format selection: direct H.264/AAC is preferred, with fallback to best available streams up to the requested quality.
- Added MP4 H.264/AAC conversion fallback for VP9/AV1 or other less compatible YouTube streams.
- Allowed 1080p requests to download the best available lower resolution when the source video is lower than 1080p.
- Added more informative main-process download logs for selectors, stderr, exit codes, and final errors.
- Improved user-facing MP4 failure messages.
- Preserved MP3 320 kbps behavior.
- Fixed mojibake in Spanish UI/error text.
- Added regression tests for selector fallback, logging, and MP3 quality handling.

## v1.0.0 - 2026-06-02

- First official Windows release.
- Added MP4 and MP3 downloads from YouTube URLs.
- Added preview metadata, custom download folder, quick download, playlist support, embedded YouTube browser, and real-time download progress.
