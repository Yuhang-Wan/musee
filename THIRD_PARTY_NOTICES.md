# Third-party notices

Musee bundles the following third-party code into `client.js` at build time.

## DOMPurify

- Project: https://github.com/cure53/DOMPurify
- Copyright (c) 2015 Mario Heiderich and contributors
- License: Apache License 2.0 OR Mozilla Public License 2.0 (used here under Apache-2.0)
- License text: https://www.apache.org/licenses/LICENSE-2.0

DOMPurify is used at runtime to sanitize HTML fetched from arXiv before it is
rendered in the full-text reader.

## PDF.js

- Project: https://github.com/mozilla/pdf.js
- Copyright (c) Mozilla and individual contributors
- License: Apache License 2.0
- License text: https://www.apache.org/licenses/LICENSE-2.0

PDF.js is bundled into `client.js` and shipped as `assets/pdf.worker.min.mjs`
to render PDF pages, text layers, highlights, and selection inside the panel.
