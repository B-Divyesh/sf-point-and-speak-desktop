# Demo sandbox

- URL: `https://point-and-speak-desktop.sociobot.in/demo` (local:
  `http://127.0.0.1:4173/demo`). `?demo=1` also suppresses the release lookup on
  the landing page.
- Sample: a fictional field-stock terminal with four order rows. The selected
  region yields three realistic OCR rows.
- Start: choose **Try it with sample data**, then activate the marked region.
- Reset: choose **Reset demo** in the persistent orange banner.
- Storage: demo state stays in JavaScript memory. It never reads or writes
  `localStorage`, IndexedDB, or the real license namespace. Tests also reserve
  the `demo:` prefix and assert that it remains empty.
- Network: the demo makes same-origin requests only. It does not call the
  release API, billing API, OCR service, or any analytics endpoint.
