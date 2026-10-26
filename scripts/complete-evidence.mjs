import fs from "node:fs";
import path from "node:path";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const root = path.resolve(import.meta.dirname, "..");
const secrets = path.resolve(root, "..", "real_labs", ".secrets");
const encrypted = fs.readFileSync(path.join(secrets, "sepolia-wallet.json"), "utf8");
const password = fs.readFileSync(path.join(secrets, "wallet-passphrase.txt"), "utf8").trim();
const provider = new JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com", 11155111, { staticNetwork: true });
const wallet = (await Wallet.fromEncryptedJson(encrypted, password)).connect(provider);
const deployment = JSON.parse(fs.readFileSync(path.join(root, "deployment.json"), "utf8"));
const artifact = JSON.parse(fs.readFileSync(path.join(root, "build", "contracts", "TokenGatedPoster.json"), "utf8"));
const gated = new Contract(deployment.contracts.TokenGatedPoster.address, artifact.abi, wallet);
const tx = await gated.post("Публикация с проверкой баланса токена", "lab4");
const receipt = await tx.wait();
deployment.contracts.TokenGatedPoster.postTransactionHash = tx.hash;
deployment.contracts.TokenGatedPoster.postBlockNumber = receipt.blockNumber;
fs.writeFileSync(path.join(root, "deployment.json"), JSON.stringify(deployment, null, 2));
console.log(JSON.stringify({ transactionHash: tx.hash, blockNumber: receipt.blockNumber }, null, 2));
