# Installation

Pravesh is a static React application. It needs Node.js only to build; the output in `dist/` can be served from any static host.

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | 18.18 or newer (20 LTS recommended) |
| npm | 9 or newer |
| Browser | Any evergreen browser (Chrome, Edge, Firefox, Safari 16+) |

## Install and run

```bash
git clone https://github.com/samhita-oss/pravesh.git
cd pravesh
npm install
npm run dev
```

The dev server starts on `http://localhost:5173`. Open it and choose **Get started** to launch the configurator.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload on port 5173 |
| `npm run typecheck` | Strict TypeScript check, no output files |
| `npm run build` | Type-checks, then writes a production build to `dist/` |
| `npm run preview` | Serves `dist/` locally on port 4173 to verify the build |

## Your first portal in five minutes

1. Run `npm run dev` and open the configurator at `/#/wizard`.
2. Use **Load example** to start from `examples/implementation-partner-network.json`, or fill in the nine steps yourself.
3. Check the **Preview** step. Submit a test application in the sandbox.
4. On **Export**, download `your-id.config.json` and `.env.example`.
5. Copy the config to `public/pravesh.config.json` and set `VITE_PRAVESH_CONFIG_URL=./pravesh.config.json` in `.env.production`.
6. Run `npm run build` and deploy `dist/`.

## Deploying

The app uses hash-based routing (`/#/portal`) and a relative base path, so `dist/` works unchanged on:

- GitHub Pages, Netlify, Vercel, Cloudflare Pages
- An S3 or GCS bucket behind a CDN
- Nginx or Apache serving a directory, including a sub-path such as `/onboarding/`

No server rewrites are required.

### Nginx example

```nginx
server {
  listen 80;
  server_name onboarding.example.org;
  root /var/www/pravesh/dist;
  location / { try_files $uri $uri/ /index.html; }
  add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com";
}
```

## Troubleshooting

- **`npm install` fails with syntax errors.** Your Node.js is too old. Run `node -v` and upgrade to 18.18+.
- **The portal shows the starter template instead of my config.** `VITE_PRAVESH_CONFIG_URL` is read at build time. Rebuild after changing `.env.production`.
- **Changes disappear after clearing site data.** The configurator stores its working copy in `localStorage`. Export JSON regularly, and commit it to your repository.
