# Cornerstone Showroom

The marketing site for Cornerstone's Brombal Group showroom in West Palm Beach. It is a single static page (`index.html`) with a photo gallery and lightbox, and it installs as a PWA so it can run full screen on a showroom display or tablet.

Brand colors, type and voice are documented in [`cornerstone-brand-guidelines.md`](cornerstone-brand-guidelines.md).

## What's in the repo

| Path | What it is |
| --- | --- |
| `index.html` | The whole site: markup, styles and scripts, including the gallery `images` array. |
| `assets/` | Hero images, served from the site itself and precached for offline use. |
| `service-worker.js` | Offline support. Caches the app shell plus any photos the visitor has viewed. |
| `manifest.webmanifest`, `app-icon-*`, `favicon*`, `apple-touch-icon.png` | PWA install metadata and icons. |
| `og-image.png`, `og-image.svg`, `og-template.html` | Social share card and its source. |
| `upload-images.mjs` | Uploads gallery photos from the local `NEW SHOWROOM/` folder to UploadThing. |
| `upload-assets.mjs`, `upload-og.mjs` | Upload the share image and favicons to UploadThing. |

Gallery photos are not stored in git. They live on [UploadThing](https://uploadthing.com) and `index.html` references them by URL (`https://bzsgnssrkj.ufs.sh/f/...`). The original files are kept in a local `NEW SHOWROOM/` folder, which is git-ignored.

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

## Adding gallery photos

You need Node 20.12 or newer and the UploadThing API token for the Cornerstone app.

1. **Set up once.** Install dependencies and add the token:

   ```sh
   npm install
   cp .env.example .env
   # then paste the token into .env as UPLOADTHING_TOKEN=...
   ```

   The token comes from the UploadThing dashboard under API Keys. `.env` is git-ignored; never commit the token.

2. **Add the photos to `NEW SHOWROOM/`** in the repo root. JPG, JPEG, PNG and WebP are supported. Export them at a sensible web size first; a long edge around 2400px is plenty.

3. **Upload only the new photos.** Pass their file names so existing photos aren't uploaded again:

   ```sh
   npm run upload:images -- IMG_0901.JPEG IMG_0902.JPEG
   ```

   Running `npm run upload:images` with no file names uploads everything in the folder, which creates duplicates of photos already on UploadThing.

   The script prints each file's URL and finishes with a JSON list of `{ filename, url, key }`.

4. **Add the URLs to `index.html`.** In the `<script>` near the bottom, append each URL to the `images` array. The first five entries are the featured 4-up grid at the top of the gallery (their `<img>` tags are also hard-coded in the featured grid markup); everything after that is built into the masonry grid automatically.

5. **Update the photo count.** Search `index.html` for the current total (for example `62`) and update it in the `gallery-count` label, the "View all N photographs" button text (it appears twice: in the markup and in the toggle script), and the `// All images array` comment.

6. **Open a pull request**, check the Vercel preview, and merge to publish.

To replace a featured photo, swap its URL both in the featured grid markup and at the same position in the `images` array so the lightbox opens the right image.

### Other upload scripts

- `npm run upload:og` uploads `og-image.png` and prints its URL. Use it after regenerating the share card, then update the `og:image` and `twitter:image` meta tags in `index.html`.
- `npm run upload:assets` uploads the share image and favicons.
