# Contributing

Thanks for helping Musee. A few ground rules keep the project usable and legally clean.

## Issues

- Bug reports: include the DSH version, Musee version, the journal or arXiv category, and the visible error text.
- Journal requests: give the journal name, ISSN, field, and whether it is open access.
- Feature requests: describe the reading workflow you want, not only the UI control.

## Pull requests

- Keep the Host and Client halves in one bundle; no new runtime dependencies without discussion.
- Client UI must use DSH theme tokens (`--dsw-alias-*`) and route visible text through the `musee` locale namespace (Chinese and English).
- Do not add code that bypasses paywalls, scrapes publisher HTML, or redistributes article PDFs.
- Run `node tools/smoke.mjs` and `node tools/build.mjs` before opening a PR.
- Keep `client.js` rebuilt and committed; it is the installed runtime artifact.

## Data and copyright

Musee ships code, not content. Do not commit publisher PDFs, full texts, or proprietary journal rankings. Journal metadata must come from public sources such as OpenAlex, Crossref, DOAJ, or arXiv.

## License

By contributing you agree that your contribution is licensed under the MIT License.
