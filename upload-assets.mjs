import { UTApi } from "uploadthing/server";
import { readFileSync } from "fs";

try {
  process.loadEnvFile();
} catch {}

if (!process.env.UPLOADTHING_TOKEN) {
  console.error("Missing UPLOADTHING_TOKEN. Add it to .env (see .env.example) or export it in your shell.");
  process.exit(1);
}

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

const files = [
  { path: "./og-image.png",     name: "cornerstone-og-image.png",    type: "image/png" },
  { path: "./favicon-512.png",  name: "cornerstone-favicon-512.png", type: "image/png" },
  { path: "./favicon-192.png",  name: "cornerstone-favicon-192.png", type: "image/png" },
  { path: "./favicon-32.png",   name: "cornerstone-favicon-32.png",  type: "image/png" },
  { path: "./favicon.svg",      name: "cornerstone-favicon.svg",     type: "image/svg+xml" },
];

const uploadFiles = files.map(f => new File([readFileSync(f.path)], f.name, { type: f.type }));
const results = await utapi.uploadFiles(uploadFiles);

results.forEach((r, i) => {
  if (r.error) console.error(`✗ ${files[i].name}:`, r.error);
  else console.log(`✓ ${files[i].name} → ${r.data.ufsUrl}`);
});
