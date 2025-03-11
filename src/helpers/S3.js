import { S3Client } from "@aws-sdk/client-s3";

const ACCOUNT_ID = "a21b9f93a0f0bb65326925e6187bc383";
const ACCESS_KEY_ID = "6fc8f764f7965ea3b6bb64a4e03db63e";
const SECRET_ACCESS_KEY =
  "65d5063d829cdf51ef7ff1158da0aa427e5169aea9bf9c2eaf63f1a2d0a9d140";
  
export const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});
