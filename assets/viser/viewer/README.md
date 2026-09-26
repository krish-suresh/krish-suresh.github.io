# Viser recording viewer

This directory contains the self-contained browser client from
[Viser 1.0.21](https://pypi.org/project/viser/1.0.21/). It plays `.viser` recordings
without a Python server. The upstream license is included in `LICENSE.txt`.

`index.html` was extracted from `viser/client/build/index.html` in the official
`viser-1.0.21-py3-none-any.whl` package. The wheel's SHA-256 is
`9458709976e2d1b59b7b4a531e0e7088234f394ee9a58ca864e002fb34ef4bfe`.

The only functional local change to `index.html` is a stylesheet link to
[`../playback.css`](../playback.css). It hides the playback speed selector while
keeping playback at the default 1x speed. Play/pause, time entry, and the timeline
remain available. Preserve this stylesheet link when replacing the viewer build.

Embed `index.html` in an iframe with `?playbackPath=` pointing to the URL-encoded
recording path. Use Jekyll's `relative_url` filter for both paths so the embed
works locally and under a deployment base URL.

The generated client is excluded from Prettier formatting.

The viewer version matches the `viserVersion` stored in the Robot Whips
recording. Newer Viser releases may use an incompatible recording format.
