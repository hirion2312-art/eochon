# Sidewalk (보도블록) Texture — Sources

- Asset: **Square Concrete Pavers** (`square_concrete_pavers`) — Poly Haven
  - Square concrete paving slabs — matches the Korean 보도블록 (sidewalk block) look.
- Asset page: https://polyhaven.com/a/square_concrete_pavers
- License: **CC0** (Poly Haven License — public domain dedication, free for any use, no attribution required)
- Resolution: 1K — 1024×1024 px, JPEG
- Downloaded: 2026-11-02 (via Poly Haven API / dl.polyhaven.org CDN)
- Tiling: seamless (verified edge mismatch mean abs diff 8.8/255 L-R, 7.9/255 T-B on diffuse)

## Files

| File | Map | Size (bytes) | Direct URL |
|---|---|---|---|
| `square_concrete_pavers_diff_1k.jpg` | Diffuse (albedo) | 787,817 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/square_concrete_pavers/square_concrete_pavers_diff_1k.jpg |
| `square_concrete_pavers_nor_gl_1k.jpg` | Normal (OpenGL — Three.js convention) | 941,484 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/square_concrete_pavers/square_concrete_pavers_nor_gl_1k.jpg |
| `square_concrete_pavers_rough_1k.jpg` | Roughness | 639,971 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/square_concrete_pavers/square_concrete_pavers_rough_1k.jpg |

Verified with PIL: all files open as JPEG, 1024×1024.
Three.js: use `diff` as `map`, `nor_gl` as `normalMap`, `rough` as `roughnessMap`; set `wrapS/wrapT = RepeatWrapping`.
