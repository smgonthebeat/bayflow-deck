# vendor: libraries the SPIN deck loads locally

Downloaded 2026-11-24 from the npm registry so the deck runs with no network. Do not edit these files; to upgrade, replace the folder from a new package.

| Folder | Package | Version | Licence | What is here |
|---|---|---|---|---|
| `three/` | `three` | 0.187.0 | MIT | `build/three.module.js`, `build/three.core.js`; `addons/` = `examples/jsm/{postprocessing,shaders,math}` |
| `gsap/` | `gsap` | 3.15.1 | GSAP standard no-charge licence (https://gsap.com/standard-license) | every `dist/*.min.js` (core and all plugins) |
| `fonts/` | `@fontsource-variable/source-serif-4` | 5.3.1 | SIL OFL 1.1 | Source Serif 4 variable (weight and optical size), latin and latin-ext; `fonts.css` declares it |

Not downloaded: Noto Serif SC (86 MB as a package). The deck's on-slide text is English; Chinese appears only inside screenshots. If Chinese text is added to a slide, it falls back to the system Songti until this font is added.

## How pages load them

The deck is served by a local web server (`../start-deck.command`), not opened as a file: browsers refuse ES modules and WebGL textures from `file://`.

```html
<link rel="stylesheet" href="vendor/fonts/fonts.css">
<script type="importmap">
{ "imports": { "three": "./vendor/three/build/three.module.js", "three/addons/": "./vendor/three/addons/" } }
</script>
<script src="vendor/gsap/gsap.min.js"></script>
```

## Kubai Icons (`kubai-icons/`, 0.15.0, MIT)

Source: https://github.com/kubai087/kubai-icons, taken from the npm packages `kubai-icons` and `kubai-icons-static` on 2026-11-24.

- `cdn/element.js`: the `<kubai-icon>` web component. It loads each icon from `cdn/icons/` on demand, recolours from one accent colour and plays the icon's motion on hover.
- `static/svg/`: every icon as a standalone SVG in the library's default blue; `static/svg-duotone/`: the flat two-tone set (502 icons).
- `icons.json`, `categories.json`: names, tags and categories.

```html
<script type="module" src="vendor/kubai-icons/cdn/element.js"></script>
<kubai-icon name="currency-dollar" size="32" color="#2B5FB8"></kubai-icon>
```

Shapes are used as drawn; only the colour changes. White as the accent colour turns an icon into a white blob, so on a dark badge use a light blue instead. Every icon is previewed to the founder before use (`../preview/icons.html`).
