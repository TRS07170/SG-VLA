# SG-VLA Project Website

Static project page for **SG-VLA: Learning Spatially-Grounded Vision-Language-Action Models for Mobile Manipulation** (CVPR 2026).

## Preview locally

Serve the repository root with any static HTTP server. For example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly is not recommended because browser security rules can change media and clipboard behavior on `file://` URLs.

Run the dependency-free site checks with:

```powershell
python scripts/validate_site.py
```

## Content sources

- `SG_VLA_CVPR_2026.zip` is the authoritative LaTeX source.
- `videos/` contains the original simulation exports.
- Web-ready derivatives live under `static/images/` and `static/videos/`.

Keep the source archive and original videos unchanged. Update the website using optimized copies in `static/`.

## Updating rollout videos

The page expects these files:

- `static/videos/pick.mp4`
- `static/videos/place.mp4`
- `static/videos/open_fridge.mp4`
- `static/videos/close_fridge.mp4`
- `static/videos/open_kitchen_counter.mp4`
- `static/videos/close_kitchen_counter.mp4`

Videos should be H.264 MP4 files with `yuv420p` pixel format and fast-start metadata. Matching poster images live under `static/images/video-posters/`.

## Publication links

The Paper link points to arXiv. Add Code, Models, or Dataset buttons only after public URLs are available; do not add disabled placeholders.

## Deployment

The repository is designed for GitHub Pages with the site served from the repository root. `.nojekyll` prevents Jekyll processing. If a custom domain is added later, create a `CNAME` file containing that domain and update the canonical/Open Graph URLs in `index.html`.

## Attribution

The visual structure is inspired by the OpenVLA project page and the Nerfies academic project-page template. See `LICENSE` for reuse terms and attribution.
