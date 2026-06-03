# Patch Notes - WhoDownloads v1.0.1

This patch addresses the "no compatible format found" error seen when downloading videos whose available YouTube streams do not match the previous strict MP4 selector.

## Fixed

- A 720p/50fps source video can now be downloaded when the user selects 1080p; the app downloads the best available resolution up to 1080p.
- MP4 downloads no longer depend only on direct H.264/AAC YouTube streams.
- VP9/AV1 streams can be converted to compatible MP4 H.264/AAC output.
- Console logs now include enough context to diagnose format selection and ffmpeg/yt-dlp failures.

## Unchanged

- MP3 320 kbps remains supported.
- Quick Download, playlist downloads, and the embedded YouTube browser keep the same workflow.
- Cookie paths are not printed in logs.
