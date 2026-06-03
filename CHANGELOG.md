# Changelog

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
