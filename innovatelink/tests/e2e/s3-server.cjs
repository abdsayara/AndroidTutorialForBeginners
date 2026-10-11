// Local S3-compatible server for E2E tests (MinIO is used in Docker deployments).
const S3rver = require("s3rver");
const fs = require("node:fs");
const dir = process.env.S3RVER_DIR || "/tmp/s3rver-data";
fs.mkdirSync(dir, { recursive: true });
const cors = `<CORSConfiguration><CORSRule><AllowedOrigin>*</AllowedOrigin><AllowedMethod>PUT</AllowedMethod><AllowedMethod>GET</AllowedMethod><AllowedHeader>*</AllowedHeader></CORSRule></CORSConfiguration>`;
new S3rver({ port: 9000, address: "127.0.0.1", silent: true, directory: dir, configureBuckets: [{ name: "innovatelink", configs: [cors] }] })
  .run()
  .then(() => console.log("s3rver listening on 9000"));
