# WhoDownloads v1.1.0

Release focused on fixing YouTube preview/download reliability for standard Windows users and preventing the app window from becoming unresponsive while loading metadata.

## What's New

- WhoDownloads now bundles a portable Node.js runtime and tells yt-dlp to use it for YouTube JavaScript challenge solving.
- Preview, playlist, download, and diagnostic yt-dlp calls now use the embedded runtime instead of depending on the Windows user's PATH.
- Video previews now have a 25 second timeout and cancel the underlying yt-dlp process when a new preview starts.
- Stale preview responses are ignored in the renderer, so older requests cannot overwrite the current URL state.
- Preview preflight checks now report missing or inaccessible `yt-dlp.exe` or `node.exe` clearly.
- `--logs` now shows preview spawn, timeout, abort, stderr, and exit details while hiding cookie file paths.

## Patch Notes

- Fixes the `Signature solving failed`, `n challenge solving failed`, and `Requested format is not available` chain caused by yt-dlp lacking a JavaScript runtime under standard Windows users.
- Fixes preview loading that could leave the renderer/window stuck in a loading state.
- Keeps MP4 retry/fallback, MP3 behavior, playlist flow, quick download, and the existing UI unchanged.
- Regenerates the Windows installer with `resources/bin/win/node/node.exe` included.

## Installation

Download `WhoDownloads-Setup-1.1.0.exe` from the release assets and run the installer.

## Notes

- Windows only for now.
- If YouTube asks for account verification, sign in from the embedded YouTube view inside the app and retry.
- Preview timeout only affects metadata loading; normal downloads still run with the existing download flow.
