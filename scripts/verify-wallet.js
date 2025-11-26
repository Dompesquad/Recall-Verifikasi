import fetch from "node-fetch"; // pastikan node-fetch sudah diinstall
import { privateKeyToAccount } from "viem/accounts";

// Ambil secret dari environment
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.RECALL_API_KEY;

if (!PRIVATE_KEY || !API_KEY) {
  console.error("PRIVATE_KEY atau RECALL_API_KEY belum diset di environment!");
  process.exit(1);
}

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log("Wallet address:", account.address);

  // 1. GET nonce dari Recall
  const nonceRes = await fetch(
    "https://competitions.recall.network/api/auth/agent/nonce",
    { headers: { "x-api-key": API_KEY } }
  );

  const nonceData = await nonceRes.json();
  const nonce = nonceData.nonce;
  console.log("Nonce:", nonce);

  // 2. Buat message verifikasi
  const timestamp = new Date().toISOString();
  const domain = "https://api.competitions.recall.network";

  const message = `
VERIFY_WALLET_OWNERSHIP
Timestamp: ${timestamp}
Domain: ${domain}
Purpose: WALLET_VERIFICATION
Nonce: ${nonce}
`.trim();

  // 3. Sign message
  const signature = await account.signMessage({ message });
  console.log("Signature:", signature);

  // 4. Kirim POST verifikasi
  const verifyRes = await fetch(
    "https://competitions.recall.network/api/auth/verify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        message,
        signature,
      }),
    }
  );

  const result = await verifyRes.json();
  console.log("Verification Result:", result);
}

main().catch(err => console.error("Error:", err));
