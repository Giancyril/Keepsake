import { S3Client } from "@aws-sdk/client-s3";

declare global {
  // eslint-disable-next-line no-var
  var _s3Client: S3Client | undefined;
}

function createS3Client(): S3Client {
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "mock-access-key";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "mock-secret-key";

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// Singleton — reuse across HMR cycles in dev
export const s3 = globalThis._s3Client ?? createS3Client();
if (process.env.NODE_ENV !== "production") {
  globalThis._s3Client = s3;
}

export const BUCKET = process.env.S3_BUCKET_NAME || "photo-vault-bucket";
