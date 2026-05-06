import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import fs from "fs";
import path from "path";

// Configuration
const PROGRAM_ID = new PublicKey("4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt");
const RPC_URL = "https://api.devnet.solana.com";

// Pool configuration parameters
const FEE_BPS = 30; // 0.3% fee
const MIN_SETTLEMENT_DELAY_SLOTS = 4;

async function main() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║       ShadowX Settle - Pool Initialization           ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");

  // Load admin keypair
  const adminKeypairPath = path.join(__dirname, "../keys/admin.json");
  if (!fs.existsSync(adminKeypairPath)) {
    throw new Error(`Admin keypair not found at ${adminKeypairPath}`);
  }
  const adminKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(adminKeypairPath, "utf-8")))
  );

  console.log("Admin pubkey:", adminKeypair.publicKey.toBase58());

  // Setup connection
  const connection = new Connection(RPC_URL, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(adminKeypair),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  // Load program IDL (you'll need to generate this separately or create manually)
  // For now, we'll construct the instruction manually
  const programId = PROGRAM_ID;

  console.log("\n📍 Program ID:", programId.toBase58());
  console.log("🌐 Network: Devnet");
  console.log("");

  // Derive pool_state PDA
  const [poolStatePDA, poolStateBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_state")],
    programId
  );

  console.log("Pool State PDA:", poolStatePDA.toBase58());
  console.log("Pool State Bump:", poolStateBump);
  console.log("");

  // Generate keypairs for relayer and Arcium verifier (you should use real ones)
  const relayerAuthority = Keypair.generate();
  const arciumVerifier = Keypair.generate();

  console.log("⚙️  Configuration:");
  console.log("  Fee: 0.30%");
  console.log("  Min Settlement Delay:", MIN_SETTLEMENT_DELAY_SLOTS, "slots");
  console.log("  Relayer Authority:", relayerAuthority.publicKey.toBase58());
  console.log("  Arcium Verifier:", arciumVerifier.publicKey.toBase58());
  console.log("");

  // Save generated keys
  const keysDir = path.join(__dirname, "../keys");
  fs.writeFileSync(
    path.join(keysDir, "relayer-authority.json"),
    JSON.stringify(Array.from(relayerAuthority.secretKey))
  );
  fs.writeFileSync(
    path.join(keysDir, "arcium-verifier.json"),
    JSON.stringify(Array.from(arciumVerifier.secretKey))
  );

  console.log("✅ Keys saved to keys/");
  console.log("");

  // Build instruction data (manual serialization for initialize_pool)
  // Format: discriminator (8 bytes) + fee_bps (2) + relayer (32) + arcium (32) + delay (8)
  const discriminator = Buffer.from([
    0xaf, 0xaf, 0x6d, 0x1f, 0x0d, 0x98, 0x9b, 0xed,
  ]); // Anchor discriminator for initialize_pool

  const data = Buffer.concat([
    discriminator,
    Buffer.from(new Uint16Array([FEE_BPS]).buffer),
    relayerAuthority.publicKey.toBuffer(),
    arciumVerifier.publicKey.toBuffer(),
    Buffer.from(new BigUint64Array([BigInt(MIN_SETTLEMENT_DELAY_SLOTS)]).buffer),
  ]);

  console.log("🔨 Building transaction...");

  const tx = new anchor.web3.Transaction().add({
    keys: [
      { pubkey: poolStatePDA, isSigner: false, isWritable: true },
      { pubkey: adminKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data,
  });

  try {
    console.log("📤 Sending transaction...");
    const signature = await provider.sendAndConfirm(tx, [adminKeypair], {
      commitment: "confirmed",
    });

    console.log("");
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║              ✅  POOL INITIALIZED                      ║");
    console.log("╚═══════════════════════════════════════════════════════╝");
    console.log("");
    console.log("📝 Transaction:", signature);
    console.log("🔗 Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("");
    console.log("Pool State Address:", poolStatePDA.toBase58());
    console.log("");
    console.log("Next steps:");
    console.log("  1. Initialize markets using initialize_market");
    console.log("  2. Users can start submitting intents");
    console.log("");
  } catch (error) {
    console.error("❌ Transaction failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
