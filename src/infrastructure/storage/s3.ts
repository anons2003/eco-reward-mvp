import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type PutAvatarObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

type AvatarStorageConfig = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for avatar uploads.`);
  }
  return value;
}

export function getAvatarStorageConfig(): AvatarStorageConfig {
  return {
    bucket: requiredEnv("S3_AVATAR_BUCKET"),
    region: requiredEnv("AWS_REGION"),
    accessKeyId: requiredEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY"),
    publicBaseUrl: process.env.S3_AVATAR_PUBLIC_BASE_URL?.trim() || undefined,
  };
}

function createAvatarS3Client(config = getAvatarStorageConfig()) {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function putAvatarObject(input: PutAvatarObjectInput) {
  const config = getAvatarStorageConfig();
  const client = createAvatarS3Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export function avatarPublicUrl(key: string) {
  const config = getAvatarStorageConfig();
  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
}
