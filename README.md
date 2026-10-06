# Cornerstone Showroom

The marketing site for Cornerstone's Brombal Group showroom in West Palm Beach. It is a single static page (`index.html`) with a photo gallery and lightbox, and it installs as a PWA so it can run full screen on a showroom display or tablet.

Brand colors, type and voice are documented in [`cornerstone-brand-guidelines.md`](cornerstone-brand-guidelines.md).

## What's in the repo

| Path | What it is |
| --- | --- |
| `index.html` | The whole site: markup, styles and scripts. |
| `assets/media-manifest.js` | Generated list of gallery photos with their Convex URLs, sizes and captions. Don't edit by hand. |
| `media/catalog.json` | The photo list you edit: which originals appear, in what order, with captions, alt text and gallery group. |
| `scripts/media.mjs` | Resizes the originals to WebP and uploads them to Convex (`npm run media:sync`). |
| `convex/` | The Convex backend: a `media` table and the functions the sync script calls. |
| `assets/` | Hero images and self-hosted fonts, served from the site itself and precached for offline use. |
| `service-worker.js` | Offline support. Caches the app shell plus photos the visitor has viewed. |
| `manifest.webmanifest`, `app-icon-*`, `favicon*`, `apple-touch-icon.png` | PWA install metadata and icons. |
| `og-image.png`, `og-image.svg`, `og-template.html` | Social share card and its source. The site links `og-image.png` directly. |

Gallery photos are not stored in git. The originals live in the local `NEW SHOWROOM/` folder (git-ignored; the master copies are in Dropbox under *CORN - Cornerstone / 06_Incoming Client Assets / COMPANY PHOTOS*). `npm run media:sync` makes 640, 1280 and 2048px WebP versions, stores them in [Convex](https://convex.dev) file storage and writes their URLs into `assets/media-manifest.js`.

## Running it locally

There is no build step. Serve the folder with any static server and open it in a browser:

```sh
npx serve .
```

The service worker only registers over `http://localhost` or HTTPS, so open the URL the server prints rather than the file directly.

## Deploying

The site is hosted on Vercel as a static project with no build command and the repo root as the output directory. Vercel deploys automatically:

- A push to `main` deploys to production.
- Every pull request gets its own preview URL, posted on the PR by the Vercel bot.

Vercel Web Analytics is enabled through the `/_vercel/insights/script.js` tag in `index.html`, so no extra setup is needed.

When you change files listed in `APP_SHELL` in `service-worker.js` (for example the hero images or icons), bump the version in `SHELL_CACHE` and `RUNTIME_CACHE` so returning visitors pick up the new files.

## Photos and Convex

### One-time setup

You need Node 20.12 or newer and access to the Cornerstone Convex project.

```sh
npm install
npx convex dev --once        # sign in, pick or create the project, push the functions in convex/
npx convex deploy            # push the same functions to the production deployment
npx convex env set MEDIA_UPLOAD_SECRET "<long random string>" --prod
cp .env.example .env         # then fill in CONVEX_URL (production) and the same MEDIA_UPLOAD_SECRET
```

`CONVEX_URL` is the production deployment URL from the Convex dashboard (Settings > URL & Deploy Key). The secret is what stops anyone else from writing to the photo store; the site itself only reads public file URLs.

### Adding or changing photos

1. Put the original in `NEW SHOWROOM/` (or point `MEDIA_SOURCE_DIR` in `.env` at another folder). Full-resolution JPEGs are fine; the script resizes them.
2. Add an entry to `media/catalog.json`: a short unique `id`, the `file` name, a `group` (`spaces`, `systems`, `details` or `evening`), a `caption` and descriptive `alt` text. Entries appear in the gallery in file order. Add `"gallery": false` for a photo used only in a page section.
3. Run `npm run media:sync`. Only new or changed files are uploaded. Add `--prune` (`npm run media:sync -- --prune`) to delete files from Convex that are no longer in the catalog.
4. Commit `media/catalog.json` and the regenerated `assets/media-manifest.js`, open a pull request, check the Vercel preview and merge.

Section images (the Scale/Movement/Material rows, the collection cards, the details grid and the visit photo) point at catalog ids through `data-media="..."` attributes in `index.html`, so swapping one is a one-word change.

To preview locally without uploading, run `npm run media:preview`. It writes the resized files to `.media-build/` and points the manifest at them; run `npm run media:sync` again before committing.
