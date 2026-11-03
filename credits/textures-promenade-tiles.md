# Promenade / Plaza Tiles Texture — Sources

- Asset: **Slab Tiles** (`slab_tiles`) — Poly Haven
  - Large stone slab tiles — suitable for a seaside promenade / plaza floor.
- Asset page: https://polyhaven.com/a/slab_tiles
- License: **CC0** (Poly Haven License — public domain dedication, free for any use, no attribution required)
- Resolution: 1K — 1024×1024 px, JPEG
- Downloaded: 2026-11-02 (via Poly Haven API / dl.polyhaven.org CDN)
- Tiling: seamless (verified edge mismatch mean abs diff 1.5/255 L-R, 1.7/255 T-B on diffuse — very clean wrap)

## Files

| File | Map | Size (bytes) | Direct URL |
|---|---|---|---|
| `slab_tiles_diff_1k.jpg` | Diffuse (albedo) | 492,538 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/slab_tiles/slab_tiles_diff_1k.jpg |
| `slab_tiles_nor_gl_1k.jpg` | Normal (OpenGL — Three.js convention) | 510,086 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/slab_tiles/slab_tiles_nor_gl_1k.jpg |
| `slab_tiles_rough_1k.jpg` | Roughness | 613,931 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/slab_tiles/slab_tiles_rough_1k.jpg |

Verified with PIL: all files open as JPEG, 1024×1024.
Three.js: use `diff` as `map`, `nor_gl` as `normalMap`, `rough` as `roughnessMap`; set `wrapS/wrapT = RepeatWrapping`.
