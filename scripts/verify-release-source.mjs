import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const packageVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
const tauriVersion = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8")).version;
const cargoVersion = readFileSync("src-tauri/Cargo.toml", "utf8").match(/^version = "([^"]+)"$/m)?.[1];
const expectedTag = `v${packageVersion}`;
const tag = process.env.GITHUB_REF_NAME;
const refType = process.env.GITHUB_REF_TYPE;
const expectedSha = process.env.GITHUB_SHA;
const checkoutSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();

const errors = [];
if (refType !== "tag") errors.push(`release ref must be a tag, received ${refType || "unset"}`);
if (tag !== expectedTag) errors.push(`release tag ${tag || "unset"} does not match ${expectedTag}`);
if (tauriVersion !== packageVersion) errors.push(`Tauri version ${tauriVersion} does not match ${packageVersion}`);
if (cargoVersion !== packageVersion) errors.push(`Cargo version ${cargoVersion || "missing"} does not match ${packageVersion}`);
if (!expectedSha || checkoutSha !== expectedSha) errors.push(`checkout ${checkoutSha} does not match workflow source ${expectedSha || "unset"}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Release ${tag} is bound to source commit ${checkoutSha}.`);
