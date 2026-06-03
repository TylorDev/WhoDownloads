# Patch Notes - WhoDownloads v1.1.0

This patch fixes two reliability issues reported on Windows: missing YouTube formats for standard users and previews that could leave the app unresponsive.

## Fixed

- yt-dlp now uses an embedded Node.js runtime to solve YouTube JavaScript challenges.
- Standard Windows users no longer depend on a separately installed Node.js runtime.
- Preview metadata loading now times out after 25 seconds instead of waiting forever.
- Starting a new preview cancels the previous yt-dlp metadata process.
- Old preview responses are ignored if the user has already changed the URL.
- Preview logs are more informative with `--logs`, while cookie file paths stay hidden.

## Unchanged

- MP4 fallback conversion remains available.
- MP3 320 kbps remains supported.
- Quick Download, playlist downloads, and the embedded YouTube browser keep the same workflow.
