import fs from "fs";
import jwt from "jsonwebtoken";

const privateKey = fs.readFileSync("AuthKey_ZGBNSXPW9L.p8");

const token = jwt.sign(
  {
    iss: "B46X894ZHC",                 // Team ID
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 15777000, // ~6 months
    aud: "https://appleid.apple.com",
    sub: "com.ivory.apple.auth",       // APPLE_CLIENT_ID (Services ID)
  },
  privateKey,
  {
    algorithm: "ES256",
    keyid: "ZGBNSXPW9L",                // Key ID
  }
);

console.log("\n🔑 Your Apple Client Secret:\n");
console.log(token);
console.log("\n✅ Copy this token and add it to your .env.local file as APPLE_CLIENT_SECRET\n");
