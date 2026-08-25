# NeoTunes Playlist Import & Export Specification

## Overview
NeoTunes supports portable JSON playlist imports and exports.

## Canonical Track Validation
When importing a playlist, `PlaylistImporterExporter.importFromJson()` queries verified music providers to map song titles and artists to canonical `Track` models. Ambiguous or low-confidence matches are flagged for user review.

## Data Privacy Guarantee
Exported playlists carry metadata (`title`, `artist`, `album`, `source`, `sourceId`). Private user credentials, session tokens, and stream URLs are strictly stripped.
