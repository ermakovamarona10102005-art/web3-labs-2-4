import fs from "node:fs";
import path from "node:path";
import { ContractFactory, JsonRpcProvider, Wallet, parseUnits } from "ethers";

const root = path.resolve(import.meta.dirname, "..");
const secretRoot = path.resolve(root, "..", "real_labs", ".secrets");
const encrypted = fs.readFileSync(path.join(secretRoot, "sepolia-wallet.json"), "utf8");
const password = fs.readFileSync(path.join(secretRoot, "wallet-passphrase.txt"), "utf8").trim();
const provider = new JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com", 11155111, { staticNetwork: true });
const wallet = (await Wallet.fromEncryptedJson(encrypted, password)).connect(provider);
const metaMask = "0x5E2207166dFeebbD77F72c600D8aF7Ff9f1eafBF";
const artifact = (name) => JSON.parse(fs.readFileSync(path.join(root, "build", "contracts", `${name}.json`), "utf8"));

async function deploy(name, args = []) {
  const a = artifact(name);
  const c = await new ContractFactory(a.abi, a.bytecode, wallet).deploy(...args);
  const tx = c.deploymentTransaction();
  await c.waitForDeployment();
  const receipt = await tx.wait();
  return { contract: c, address: await c.getAddress(), transactionHash: tx.hash, blockNumber: receipt.blockNumber };
}

const poster = await deploy("Poster");
const token = await deploy("LabToken", ["Student Lab Token", "SLT", 1000n]);
const gated = await deploy("TokenGatedPoster", [token.address, parseUnits("10", 18)]);

const posterPost = await poster.contract.post("Первая запись лабораторной работы", "lab2");
await posterPost.wait();
const tokenTransfer = await token.contract.transfer(metaMask, parseUnits("100", 18));
await tokenTransfer.wait();
const tokenOwnership = await token.contract.transferOwnership(metaMask);
await tokenOwnership.wait();
const gatedOwnership = await gated.contract.transferOwnership(metaMask);
await gatedOwnership.wait();

const result = {
  network: "Ethereum Sepolia",
  chainId: 11155111,
  deployer: wallet.address,
  metaMask,
  contracts: {
    Poster: { address: poster.address, transactionHash: poster.transactionHash, postTransactionHash: posterPost.hash },
    LabToken: { address: token.address, transactionHash: token.transactionHash, transferTransactionHash: tokenTransfer.hash, ownershipTransactionHash: tokenOwnership.hash },
    TokenGatedPoster: { address: gated.address, transactionHash: gated.transactionHash, ownershipTransactionHash: gatedOwnership.hash, threshold: parseUnits("10", 18).toString() }
  }
};
fs.writeFileSync(path.join(root, "deployment.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
