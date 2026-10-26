import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const deployment = JSON.parse(fs.readFileSync(path.join(root, "deployment.json"), "utf8"));
const results = {};

function readSource(sourceName) {
  const normalized = sourceName.replace(/^project:\//, "");
  const local = normalized.startsWith("@")
    ? path.join(root, "node_modules", ...sourceName.split("/"))
    : path.join(root, ...normalized.split("/"));
  return fs.readFileSync(local, "utf8");
}

for (const name of ["Poster", "LabToken", "TokenGatedPoster"]) {
  const artifact = JSON.parse(fs.readFileSync(path.join(root, "build", "contracts", `${name}.json`), "utf8"));
  const info = deployment.contracts[name];
  const metadata = JSON.parse(artifact.metadata);
  const sources = Object.fromEntries(Object.keys(metadata.sources).map(sourceName => [sourceName, { content: readSource(sourceName) }]));
  const targetSource = Object.entries(metadata.settings.compilationTarget).find(([, contractName]) => contractName === name)[0];
  const settings = { ...metadata.settings, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object", "metadata"] } } };
  delete settings.compilationTarget;
  const payload = {
    stdJsonInput: { language: metadata.language, sources, settings },
    compilerVersion: artifact.compiler.version.split(".Emscripten")[0],
    contractIdentifier: `${targetSource}:${name}`,
    creationTransactionHash: info.transactionHash
  };
  const response = await fetch(`https://sourcify.dev/server/v2/verify/11155111/${info.address}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload)
  });
  let status = await response.json();
  if (!response.ok) throw new Error(`${name}: ${JSON.stringify(status)}`);
  if (status.verificationId) {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1500));
      status = await (await fetch(`https://sourcify.dev/server/v2/verify/${status.verificationId}`)).json();
      if (status.isJobCompleted) break;
    }
  }
  results[name] = status;
  console.log(name, JSON.stringify(status));
}
fs.writeFileSync(path.join(root, "verification.json"), JSON.stringify(results, null, 2));
