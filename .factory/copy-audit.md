# Copy audit

Audited 2026-08-29 after adversarial polish round 1. Counts treat hyphenated
terms and prices as one word. Every landing sentence is at most 22 words. No
sentence contains a banned marketing word.

## First screen

| Sentence | Words | Claim coverage |
| --- | ---: | --- |
| Read selected screen text aloud. | 5 | `selected-region-speech` |
| For low-vision desktop users when screen readers miss text in remote desktops, old software, games, or visual app interfaces. | 19 | Audience and situation |
| See an editable result at once. | 6 | `demo-ready` |
| Your real data stays untouched. | 5 | `no-demo-storage` |
| Local: captured images stay on your computer. | 7 | `local-only` |
| Offline: English text-recognition files ship with the app. | 8 | `bundled-recognition` |
| Price: core tools are free; supporter license is $19 once. | 10 | `account-free-core`, `checkout-live` |
| Draw a region around the text you want to hear. | 10 | `selected-region-speech` |

Read aloud: “Read selected screen text aloud, for low-vision desktop users
when screen readers miss text. Try it with sample data.” This states the job,
audience, situation, and first action in one breath.

## Landing sections

| Sentence | Words | Result |
| --- | ---: | --- |
| Checking the latest release. | 4 | Pass |
| Downloads are being published. | 4 | Pass |
| Check the release page for availability. | 6 | Pass |
| These three frames show the complete capture. | 7 | Pass |
| Draw around the text that the other app does not expose. | 11 | Pass |
| Correct the editable result before using it. | 7 | Pass |
| Hear the text, copy it, or keep it visible. | 10 | Pass |
| The configured shortcut is Ctrl+Shift+Space. | 5 | Pass; `configured-shortcut` |
| The capture window lets you choose a region. | 8 | Pass |
| Text recognition processes the region you draw on your computer. | 10 | Pass; `selected-region-speech` |
| Edit the result, change its speech speed, or keep it visible. | 11 | Pass; `speech-speed` |
| A capture begins after you choose Capture screen. | 9 | Pass |
| Captured images are not uploaded. | 5 | Pass; `local-only` |
| Captures stay in memory and disappear when the capture window reloads or closes. | 13 | Pass; `capture-memory` |
| This is an assistive utility, not a safety or medical product. | 11 | Pass |
| The free app includes capture, text recognition, speech, copy, and pin. | 11 | Pass; `account-free-core` |
| The one-time supporter license adds two blueprint page themes. | 9 | Pass; `supporter-themes` |

## Demo and error states

| Sentence | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved. | 7 | Pass; `no-demo-storage` |
| Edit the result, then speak, copy, or pin it. | 10 | Pass |
| Sample restored. | 2 | Pass |
| Review it, then speak, copy, or pin it. | 9 | Pass |
| Activate the marked region to restore the sample result. | 9 | Pass |
| There is no text to speak. | 7 | Pass |
| Restore the sample result first. | 5 | Pass |
| This address does not match a page. | 7 | Pass |

## Terminology

| Concept | One term |
| --- | --- |
| Rectangle chosen by the user | region |
| Reading pixels as text | text recognition |
| Recognised editable output | result |
| Temporary visible result | pin |
| Product demonstration | demo |
| Paid purchase token | supporter license |
| Keyboard invocation | shortcut |
| Native interface used to capture | capture window |

“OCR,” “sandbox,” “sheet,” and “canvas” are absent from visitor and README
copy. “OCR” remains only in developer implementation names where it describes
the underlying library.
