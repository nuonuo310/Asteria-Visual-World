# Chat / Call visual source synchronization — 2026-10-14

## Source

- Site: https://asteria-chat-call-visual-preview.tnuonuo310.chatgpt.site
- Sites project: `appgprj_6acceca06764819187f4742946425489`
- Current Site version at import: **36**
- Source commit: `cc26dfde9f7acfbb7a9f32ac418a4db0bcd38836`
- GitHub base: `4bb81ada4f11a36e9e413107f1bc6224b41d71f6`

## Imported surfaces

All files under the Site's `dist/chat/`, `dist/call/`, and `dist/preview/` are included, with unchanged images, adapters, visual styling, and synthetic preview content. This includes both retained Shen avatar variants, Nuo's smiling avatar, the cocoa bear background, and the retained call card asset.

Only resource and navigation paths are adapted for GitHub Pages' `/Asteria-Visual-World/` project prefix:

| From | Destination |
| --- | --- |
| Home / Mind → Chat | `chat/` |
| Chat → Home | `../index.html` |
| Chat → Mind | `../mind.html` |
| Chat → Call | `../call/` |
| Call → preview chooser | `../preview/` |
| Preview chooser → Chat / Call | `../chat/`, `../call/` |

The Site's redirect-only `dist/index.html` is omitted because the repository already owns the Home entry point. Site-specific hosting metadata, Git credentials, historical deployment archives, and source Git metadata are not copied into this GitHub repository. The live Sites deployment remains unchanged.

## Boundary and validation

Chat / Call remain visual previews using synthetic data. This import does not connect a model, microphone, speech service, or runtime backend.

- Imported file completeness checked against the source directories.
- Images and adapter scripts checked byte-for-byte against the source.
- HTML/CSS local resource paths and navigation destinations checked beneath both a root origin and the GitHub Pages project prefix.
- External and inline JavaScript syntax checked.
- Home / Mind diffs restricted to their Chat destination; their visual markup and layout remain unchanged.
- Browser rendering / click QA was unavailable in this session; no new visual changes were made.
