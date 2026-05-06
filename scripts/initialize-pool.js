#!/usr/bin/env node

const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const PROGRAM_ID = new PublicKey("4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt");
const RPC_URL = "https://api.devnet.solana.com";
const FEE_BPS = 30;
const MIN_SETTLEMENT_DELAY_SLOTS = 4;

async function main() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║       ShadowX Settle - Pool Initialization           ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  const adminKeypairPath = path.join(__dirname, "../keys/admin.json");
  if (!fs.existsSync(adminKeypairPath)) {
    console.error(`❌ Admin keypair not found at ${adminKeypairPath}`);
    console.log("\nPlease create it first:");
    console.log("  mkdir -p keys");
    console.log("  solana-keygen new -o keys/admin.json\n");
    process.exit(1);
  }

  const adminKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(adminKeypairPath, "utf-8")))
  );

  console.log("Admin pubkey:", adminKeypair.publicKey.toBase58());

  const connection = new Connection(RPC_URL, "confirmed");
  console.log("\n📍 Program ID:", PROGRAM_ID.toBase58());
  console.log("🌐 Network: Devnet\n");

  const [poolStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_state")],
    PROGRAM_ID
  );

  console.log("Pool State PDA:", poolStatePDA.toBase58(), "\n");

  const relayerAuthority = Keypair.generate();
  const arciumVerifier = Keypair.generate();

  console.log("⚙️  Configuration:");
  console.log("  Fee: 0.30%");
  console.log("  Min Settlement Delay:", MIN_SETTLEMENT_DELAY_SLOTS, "slots");
  console.log("  Relayer Authority:", relayerAuthority.publicKey.toBase58());
  console.log("  Arcium Verifier:", arciumVerifier.publicKey.toBase58(), "\n");

  const keysDir = path.join(__dirname, "../keys");
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(keysDir, "relayer-authority.json"),
    JSON.stringify(Array.from(relayerAuthority.secretKey))
  );
  fs.writeFileSync(
    path.join(keysDir, "arcium-verifier.json"),
    JSON.stringify(Array.from(arciumVerifier.secretKey))
  );

  console.log("✅ Keys saved to keys/\n");

  // CORRECT discriminator for initialize_pool
  const discriminator = Buffer.from([95, 180, 10, 172, 84, 174, 232, 40]);
  
  const feeBuf = Buffer.allocUnsafe(2);
  feeBuf.writeUInt16LE(FEE_BPS, 0);
  
  const delayBuf = Buffer.allocUnsafe(8);
  delayBuf.writeBigUInt64LE(BigInt(MIN_SETTLEMENT_DELAY_SLOTS), 0);

  const data = Buffer.concat([
    discriminator,
    feeBuf,
    relayerAuthority.publicKey.toBuffer(),
    arciumVerifier.publicKey.toBuffer(),
    delayBuf,
  ]);

  console.log("🔨 Building transaction...");

  const tx = new anchor.web3.Transaction().add({
    keys: [
      { pubkey: poolStatePDA, isSigner: false, isWritable: true },
      { pubkey: adminKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  try {
    console.log("📤 Sending transaction...");
    const signature = await connection.sendTransaction(tx, [adminKeypair], {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    console.log("⏳ Confirming...");
    await connection.confirmTransaction(signature, "confirmed");

    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║              ✅  POOL INITIALIZED                      ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");
    console.log("📝 Transaction:", signature);
    console.log("🔗 Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet\n`);
    console.log("Pool State Address:", poolStatePDA.toBase58(), "\n");
    console.log("Next steps:");
    console.log("  1. Initialize markets using initialize_market");
    console.log("  2. Users can start submitting intents\n");
  } catch (error) {
    console.error("\n❌ Transaction failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
