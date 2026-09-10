import { expect } from "chai";
import { ethers } from "hardhat";
import { DealLock } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DealLock — Penalty Logic", function () {
  let dealLock: DealLock;
  let buyer: HardhatEthersSigner;
  let seller: HardhatEthersSigner;

  const termsHash = ethers.keccak256(ethers.toUtf8Bytes("penalty-test-terms"));
  const futureDeadline = () => Math.floor(Date.now() / 1000) + 86400 * 30;

  beforeEach(async () => {
    [buyer, seller] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DealLock");
    dealLock = await Factory.deploy() as DealLock;
    await dealLock.waitForDeployment();
  });

  async function createAndConfirmDeal(stake: bigint, penaltyPct: number) {
    await dealLock.connect(buyer).createDeal(
      seller.address, 0n, termsHash, futureDeadline(), penaltyPct,
      { value: stake }
    );
    const id = await dealLock.totalDeals();
    await dealLock.connect(seller).confirmDeal(id);
    return id;
  }

  it("buyer reporting breach pays penalty to seller", async () => {
    const stake = ethers.parseEther("0.01");
    const penaltyPct = 10;
    const dealId = await createAndConfirmDeal(stake, penaltyPct);

    const expectedPenalty = (stake * BigInt(penaltyPct)) / 100n;
    const sellerBefore = await ethers.provider.getBalance(seller.address);

    await expect(dealLock.connect(buyer).reportBreach(dealId))
      .to.emit(dealLock, "DealBreached")
      .withArgs(dealId, buyer.address, expectedPenalty, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

    const sellerAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerAfter - sellerBefore).to.equal(expectedPenalty);
  });

  it("deal with no stake can still report breach (zero penalty)", async () => {
    const dealId = await createAndConfirmDeal(0n, 10);

    await expect(dealLock.connect(buyer).reportBreach(dealId))
      .to.emit(dealLock, "DealBreached")
      .withArgs(dealId, buyer.address, 0n, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
  });

  it("cannot breach an already breached deal", async () => {
    const dealId = await createAndConfirmDeal(0n, 10);
    await dealLock.connect(buyer).reportBreach(dealId);
    await expect(dealLock.connect(buyer).reportBreach(dealId))
      .to.be.revertedWith("DealLock: Invalid state for this action");
  });

  it("completeDeal returns stake to buyer", async () => {
    const stake = ethers.parseEther("0.005");
    const dealId = await createAndConfirmDeal(stake, 10);

    const buyerBefore = await ethers.provider.getBalance(buyer.address);
    const completeTx = await dealLock.connect(buyer).completeDeal(dealId);
    const receipt = await completeTx.wait();
    const gasUsed = receipt!.gasUsed * completeTx.gasPrice!;
    const buyerAfter = await ethers.provider.getBalance(buyer.address);

    expect(buyerAfter - buyerBefore + gasUsed).to.equal(stake);
  });

  it("only buyer can complete a deal", async () => {
    const dealId = await createAndConfirmDeal(0n, 10);
    await expect(dealLock.connect(seller).completeDeal(dealId))
      .to.be.revertedWith("DealLock: Only buyer");
  });
});
