# Vita Changelog

Alle relevanten Änderungen pro Release. Format: [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).
Vita folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Maintainer-Workflow

Vor jedem Release:

1. `## [Unreleased]` zu `## [X.Y.Z] — YYYY-MM-DD` umbenennen + neuen leeren `## [Unreleased]` darüber einfügen.
2. `pnpm version X.Y.Z` ausführen (erzeugt Commit + Tag `vX.Y.Z`).
3. `git push --follow-tags origin main`.
4. CI baut + draftet Release. Maintainer sichtet auf GitHub, klickt "Publish Release".
