// scripts/factory-createBond.ts
import { ethers } from "hardhat";
import factoryAdddress from "../../beacon-factory-address.json"; 
import dotenvx from "@dotenvx/dotenvx";
//? CUARTO PASO:  repetir este paso cuantas veces se quiera. Cada bono tendrá su propia dirección
dotenvx.config();
async function main() {
  const factory = await ethers.getContractAt("SecurityBondFactory", factoryAdddress); // Dirección del Factory
  const adminAddress = process.env.API_WALLET_PUBLIC_KEY; // Dirección del wallet de 0xAdmin
  const iface = new ethers.Interface([
    "function initialize(string,string,uint256,string,string,string,address)"
  ]);

  const initData = iface.encodeFunctionData("initialize", [
    "MyBond",           // name
    "BND",              // symbol
    ethers.parseUnits("1000000", 18), // cap
    "ES1234567890",     // ISIN
    "bond",             // instrumentType
    "ES",               // jurisdiction
    adminAddress   // admin
  ]);

  const tx = await factory.createBond(initData, adminAddress);
  const receipt = await tx.wait();
  console.log("Bond deployed via factory:", receipt.logs?.[0].address);
}

main();
