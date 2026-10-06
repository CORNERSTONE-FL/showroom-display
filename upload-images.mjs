import { UTApi } from "uploadthing/server";
import { readFileSync, readdirSync } from "fs";
import { join, extname } from "path";

const token = process.env.UPLOADTHING_TOKEN;
if (!token) {
  console.error("Missing UPLOADTHING_TOKEN. Copy .env.example to .env, add your token, and run with: node --env-file=.env <script>");
  process.exit(1);
}

const utapi = new UTApi({ token });

const SHOWROOM_DIR = "./NEW SHOWROOM";
const VALID_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

async function uploadImages() {
  const files = readdirSync(SHOWROOM_DIR).filter(f =>
    VALID_EXTS.includes(extname(f).toLowerCase())
  );

  console.log(`Found ${files.length} images to upload...`);

  const results = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    console.log(`Uploading batch ${Math.floor(i/BATCH_SIZE)+1}: ${batch.join(", ")}`);

    const uploadFiles = batch.map(filename => {
      const filepath = join(SHOWROOM_DIR, filename);
      const buffer = readFileSync(filepath);
      const ext = extname(filename).toLowerCase();
      const mimeType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
      return new File([buffer], filename, { type: mimeType });
    });

    try {
      const response = await utapi.uploadFiles(uploadFiles);
      for (let j = 0; j < response.length; j++) {
        const r = response[j];
        if (r.error) {
          console.error(`Error uploading ${batch[j]}:`, r.error);
        } else {
          console.log(`✓ ${batch[j]} → ${r.data.ufsUrl || r.data.url}`);
          results.push({
            filename: batch[j],
            url: r.data.ufsUrl || r.data.url,
            key: r.data.key,
          });
        }
      }
    } catch (err) {
      console.error("Batch error:", err);
    }
  }

  console.log("\n=== UPLOAD COMPLETE ===");
  console.log(JSON.stringify(results, null, 2));
  return results;
}

uploadImages();
