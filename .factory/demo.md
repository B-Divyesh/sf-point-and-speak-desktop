# Demo sandbox

- Direct URL: `https://point-and-speak-desktop.sociobot.in/?demo=1`.
  `/demo` opens the same isolated state.
- One-click entry: **Try it with sample data** on the landing first screen.
- Initial state: the selected region and three realistic inventory rows are
  already visible as editable text. Speak, Copy, Pin, and speech speed work
  immediately. **Replay this sample region** restores the capture result.
- Persistent banner: **Demo — sample data, nothing is saved**, with
  **Reset demo** and **Start for real**.
- Reset: restores the original editable rows, removes a pin, and focuses the
  result. It does not write browser storage.
- Isolation: demo state exists only in the current DOM. The demo route does not
  read or write localStorage, IndexedDB, cookies, the license namespace, or the
  release cache. Entering demo aborts pending release and license requests.
- Exit: **Start for real** discards the DOM state and opens the real landing
  route. Existing real browser data is left unchanged.
- Network: the demo makes same-origin requests only. It does not call GitHub,
  billing, a recognition service, or analytics.
- Offline: the service worker caches the shell, so `?demo=1` reloads with the
  seeded result after the first visit.

Verification: `npm test -- --grep @claim:demo-ready` and
`npm test -- --grep @claim:no-demo-storage`.
