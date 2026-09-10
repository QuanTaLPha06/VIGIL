import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [buyer, seller] = await ethers.getSigners();
  const networkName = network.name;

  // Load deployed address
  const deploymentPath = path.join(__dirname, `../deployments/${networkName}.json`);
  if (!fs.existsSync(deploymentPath)) {
    console.error(`No deployment found for ${networkName}. Run deploy first.`);
    process.exit(1);
  }

  const { contractAddress } = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const DealLock = await ethers.getContractFactory("DealLock");
  const dealLock = DealLock.attach(contractAddress);

  console.log("─────────────────────────────────────────");
  console.log("  VIGIL DealLock — Demo Seed");
  console.log("─────────────────────────────────────────");
  console.log(`  Contract: ${contractAddress}`);
  console.log(`  Buyer:    ${buyer.address}`);
  console.log(`  Seller:   ${seller.address}`);
  console.log("─────────────────────────────────────────\n");

  // ── Create demo deal ────────────────────────────────────────
  const termsData = {
    dealId: "DEMO-001",
    buyerName: "Sharma Enterprises",
    sellerName: "Tech Supplies Ltd",
    amount: 200000,
    currency: "INR",
    paymentDeadline: "2026-09-30",
    penaltyPercent: 10,
    description: "Supply of 50 units of industrial components",
  };

  const canonical = JSON.stringify(termsData, Object.keys(termsData).sort());
  const termsHash = ethers.keccak256(ethers.toUtf8Bytes(canonical));

  const deadline = Math.floor(new Date("2026-09-30").getTime() / 1000);
  const stakeAmount = ethers.parseEther("0.001"); // Tiny testnet stake

  console.log("📝 Creating demo deal...");
  const tx = await dealLock.connect(buyer).createDeal(
    seller.address,
    ethers.parseEther("0.05"), // ~₹200k at demo MATIC price
    termsHash,
    deadline,
    10,
    { value: stakeAmount }
  );
  const receipt = await tx.wait();
  console.log(`✅ Deal created! Tx: ${receipt?.hash}`);
  console.log(`   Terms hash: ${termsHash}`);

  // ── Seller confirms ─────────────────────────────────────────
  const totalDeals = await dealLock.totalDeals();
  const dealId = totalDeals;

  console.log("\n🤝 Seller confirming deal...");
  const confirmTx = await dealLock.connect(seller).confirmDeal(dealId);
  await confirmTx.wait();
  console.log("✅ Deal confirmed by seller!");

  console.log("\n─────────────────────────────────────────");
  console.log("  Demo seed complete. DealId:", dealId.toString());
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
