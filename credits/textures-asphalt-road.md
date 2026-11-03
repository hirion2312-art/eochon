# Asphalt Road Texture — Sources

- Asset: **Asphalt 01** (`asphalt_01`) — Poly Haven
- Asset page: https://polyhaven.com/a/asphalt_01
- License: **CC0** (Poly Haven License — public domain dedication, free for any use, no attribution required)
- Resolution: 1K — 1024×1024 px, JPEG
- Downloaded: 2026-11-02 (via Poly Haven API / dl.polyhaven.org CDN)
- Tiling: seamless (Poly Haven textures are authored tileable; verified edge mismatch mean abs diff 5.2/255 on diffuse)

## Files

| File | Map | Size (bytes) | Direct URL |
|---|---|---|---|
| `asphalt_01_diff_1k.jpg` | Diffuse (albedo) | 739,513 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_01/asphalt_01_diff_1k.jpg |
| `asphalt_01_nor_gl_1k.jpg` | Normal (OpenGL — Three.js convention) | 1,237,059 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_01/asphalt_01_nor_gl_1k.jpg |
| `asphalt_01_rough_1k.jpg` | Roughness | 344,964 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_01/asphalt_01_rough_1k.jpg |

Verified with PIL: all files open as JPEG, 1024×1024.
Three.js: use `diff` as `map`, `nor_gl` as `normalMap`, `rough` as `roughnessMap`; set `wrapS/wrapT = RepeatWrapping`.
