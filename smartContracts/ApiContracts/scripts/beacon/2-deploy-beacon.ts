// scripts/deploy-beacon.ts
import { ethers } from "hardhat";
import * as fs from "fs";
import securityToken from "../../security-token-address.json";
//? SEGUNDO PASO: DESPLEGAR UN BEACON - SOLO SE DESPLIEGA UNA VEZ
async function main() {
  const implAddress = securityToken // Dirección obtenida del paso 1
  const Beacon = await ethers.getContractFactory("UpgradeableBeacon");
  const beacon = await Beacon.deploy(implAddress);
  await beacon.waitForDeployment();
  const address = await beacon.getAddress();

  // Guardar la dirección en un archivo JSON
  const json = { address };
  fs.writeFileSync(
    "upgradeeable-beacon-address.json",
    JSON.stringify(json, null, 2)
  );

  console.log("Beacon deployed at:", address);
}

main();