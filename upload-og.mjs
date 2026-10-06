import { UTApi } from "uploadthing/server";
import { readFileSync } from "fs";

const token = process.env.UPLOADTHING_TOKEN;
if (!token) {
  console.error("Missing UPLOADTHING_TOKEN. Copy .env.example to .env, add your token, and run with: node --env-file=.env <script>");
  process.exit(1);
}

const utapi = new UTApi({ token });

const buffer = readFileSync("./og-image.png");
const file = new File([buffer], "cornerstone-og-image.png", { type: "image/png" });

const [result] = await utapi.uploadFiles([file]);
if (result.error) {
  console.error("Upload failed:", result.error);
} else {
  console.log("OG image URL:", result.data.ufsUrl);
}
