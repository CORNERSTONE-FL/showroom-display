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

const buffer = readFileSync("./og-image.png");
const file = new File([buffer], "cornerstone-og-image.png", { type: "image/png" });

const [result] = await utapi.uploadFiles([file]);
if (result.error) {
  console.error("Upload failed:", result.error);
} else {
  console.log("OG image URL:", result.data.ufsUrl);
}
