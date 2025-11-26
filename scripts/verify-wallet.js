import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

const API_KEY = process.env.RECALL_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY);

  console.log("Wallet address:", account.address);

  // 1. GET nonce dari Recall
  const nonceResponse = await fetch(
    "https://competitions.recall.network/api/auth/agent/nonce",
    {
      headers: { "x-api-key": API_KEY }
    }
  );

  const { nonce } = await nonceResponse.json();
  console.log("Nonce:", nonce);

  // 2. Buat pesan verifikasi
  const timestamp = new Date().toISOString();
  const domain = "https://api.competitions.recall.network";

  const message = `
VERIFY_WALLET_OWNERSHIP
Timestamp: ${timestamp}
Domain: ${domain}
Purpose: WALLET_VERIFICATION
Nonce: ${nonce}
`.trim();

  // 3. Sign message menggunakan private key
  const signature = await account.signMessage({ message });

  console.log("Signature created.");

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

main();
