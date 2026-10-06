import { UTApi } from "uploadthing/server";
import { readFileSync } from "fs";

if (!process.env.UPLOADTHING_TOKEN) {
  console.error("Missing UPLOADTHING_TOKEN. Add it to .env and run: node --env-file=.env " + process.argv[1].split("/").pop());
  process.exit(1);
}

// UTApi reads UPLOADTHING_TOKEN from the environment.
const utapi = new UTApi();

const buffer = readFileSync("./og-image.png");
const file = new File([buffer], "cornerstone-og-image.png", { type: "image/png" });

const [result] = await utapi.uploadFiles([file]);
if (result.error) {
  console.error("Upload failed:", result.error);
} else {
  console.log("OG image URL:", result.data.ufsUrl);
}
