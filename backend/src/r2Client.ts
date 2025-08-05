import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const r2 = new S3Client({
  region: process.env.R2_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY as string,
    secretAccessKey: process.env.R2_SECRET_KEY as string,
  },
  endpoint: process.env.R2_ENDPOINT as string,
});

export { r2 };