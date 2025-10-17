Patti Note Calculator

Open `index.html` in your browser (double-click or use Live Server). The left side contains inputs; the right side shows a preview matching your provided note layout. Use "Export PNG" to download the filled note as an image or "Copy Image" to copy it to the clipboard (browser support required).

Notes:
 - Date input will format using your browser locale.
 - If "Copy Image" fails, use Export PNG and then copy the downloaded file.
 - The export uses an SVG foreignObject technique; some complex CSS may not render in older browsers. Use Chrome/Edge for best results.

## Deployment
To deploy on Vercel (recommended):

1. Import this repository into Vercel via "New Project" -> GitHub.
2. Use default settings — Vercel will run `npm run build` at repo root.
3. The `vercel.json` file configures Vercel to use `dist/` as the output directory. The root `package.json` runs `scripts/build.js` which copies `src/` into `dist/`.

You can also run a local build and preview before deploying:

```bash
npm run build
npx vercel dev
```
Patti Note Calculator

Open `index.html` in your browser (double-click or use Live Server). The left side contains inputs; the right side shows a preview matching your provided note layout. Use "Export PNG" to download the filled note as an image or "Copy Image" to copy it to the clipboard (browser support required).

Notes:
- Date input will format using your browser locale.
- If "Copy Image" fails, use Export PNG and then copy the downloaded file.
- The export uses an SVG foreignObject technique; some complex CSS may not render in older browsers. Use Chrome/Edge for best results.
