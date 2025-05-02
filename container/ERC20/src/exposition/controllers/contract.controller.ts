import { ContractTransactionReceipt, ContractTransactionResponse, Overrides, TransactionRequest } from "ethers";
import { Request } from "express";

import { loadAllContracts } from "../../bootstrap/contract.bootstrap";
import { callContractMethod, executeContractMethod, initContractsService, initContractsServiceAdmin } from "../../services/contracts.service";
import AppResult from "../../types/AppResult.type";
import Logger from "../../helpers/logger.helper";
import Config from "../../types/Config.type";

let config: Config;
let logger: Logger;




export async function manageUseMethod(req: Request): Promise<AppResult> {
    const contractName: string = "";
    const contractAddress: string = "" || req.params.address;
    const methodName: string = req.params.method;
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    const result: any = await callContractMethod(contractName, contractAddress, methodName, args, options);

    return {
        statusCode: 200,
        body: {
            message: 'Success',
            result
        }
    };
}


export async function callContractMethodController(req: Request): Promise<AppResult> {
  const contractName: string = "";
  const contractAddress: string = "" || req.params.address;
  const methodName: string = req.params.method;
  const args: any[] = req.body.args || [];
  const options: Overrides = req.body.options || {};

  const result: any = await callContractMethod(contractName, contractAddress, methodName, args, options);

  return {
    statusCode: 200,
    body: {
      message: 'Success',
      result
    }
  };
}

export async function executeContractMethodController(req: Request): Promise<AppResult> {
  const contractName: string = "";
  const contractAddress: string = "" || req.params.address;
  const methodName: string = req.params.method;
  const args: any[] = req.body.args || [];
  const options: Overrides = req.body.options || {};


  logger.info(`INITIALIZING SERVICES executeContractMethodController`); 
  const contracts = await loadAllContracts(config, logger);
 //initContractsService(logger, contracts, config);

  const result: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, args, options);

  return {
    statusCode: 201,
    body: {
      message: result instanceof ContractTransactionReceipt ? 'Transaction executed' : 'Transacion processed',
      result
    }
  }
}
export async function createBond(req: Request): Promise<AppResult> {
    const contractName: string = "BondFactory";
    const contractAddress: string = config.CONTRACT.ADDRESS_BOND;    
    const methodName: string = req.params.method;
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    const results: { network: string; address: string | null }[] = [];

    logger.info(`CREATING CreateBond IN alastria`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, "ALASTRIA");


    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, args, options);

    if (resultAlastria && 'logs' in resultAlastria && resultAlastria.logs.length > 0) {
        const address = resultAlastria.logs[0].address;
        logger.info(`account alastri: ${resultAlastria.logs[0].address}`);
        results.push({ network: "ALASTRIA", address });
    } else {
        logger.warn("No logs returned from Alastria deployment.");
        results.push({ network: "ALASTRIA", address: null });
    }

    return {
        statusCode: 201,
        body: {
            message: "Transactions executed successfully",
            accounts: results,
        },
    };
}

export async function mintBond(req: Request): Promise<AppResult> {   
    const contractName: string = "Bond";    
    const methodName: string = "mint";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

   // const bondAdress: string = "0xF28b8E2bE2Bc589d44F756083a9c687a72849dAF";
   // este es el caller de la function
    const bondAddress: string = args[0];
    const accountAddressOwner: string = args[1];
    const amount: string = args[2];
    
    // SIEMPRE EN ALASTRIA 
    const results: { network: string; address: string | null }[] = [];

    logger.info(`INITIALIZING SERVICES mintBond`);

    logger.info(`CREATING IN alastria`);
    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [accountAddressOwner, amount];

    initContractsService(logger, contracts, config, "ALASTRIA" );
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, bondAddress, methodName, newArgs, options);
    /*
    if (resultAlastria && 'logs' in resultAlastria && resultAlastria.logs.length > 0) {
        const address = resultAlastria.logs[0].address;
        logger.info(`account alastri: ${resultAlastria.logs[0].address}`);
        results.push({ network: "ALASTRIA", address });
    } else {
        logger.warn("No logs returned from Alastria deployment.");
        results.push({ network: "ALASTRIA", address: null });
    }*/

    return {
        statusCode: 201,
        body: {
            message: resultAlastria instanceof ContractTransactionReceipt ? 'Transaction executed' : 'Transacion processed',
            resultAlastria
        }
    }
}

export async function bridge(req: Request): Promise<AppResult> {

    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;
   
    const options: Overrides = req.body.options || {};
    const args: any[] = req.body.args || [];
    const accountAddressOwner: string = args[1];
    const bondAddress: string = args[0];
    const amount: string = args[2];


    const contractNameApprove: string = "Account";
    const methodNameApprove: string = "approveERC20";
    const contractAddressApprove: string = accountAddressOwner;

    const tokenName = args[3];
    const tokenSymbol = args[4];
    const priceToken = args[5];
    const apiWalletPublic = config.NETWORK.API_WALLET_PUBLIC;
     

    const approveArgs: any[] = [bondAddress, contractAddressVault, amount];
    logger.info(`INITIALIZING SERVICES    --     approveERC20`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, "ALASTRIA");

    const resultApprove: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractNameApprove, contractAddressApprove, methodNameApprove, approveArgs, options);

    if (resultApprove && 'status' in resultApprove && resultApprove.status === 1) {
        logger.info("Approve transaction succeeded. Waiting 10 seconds...");

        await delay(10_000); // espera 10s (10,000 ms)

        // Llama a la siguiente función
        const contractName: string = "Vault";
        const methodName: string = "deposit";
        const newArgs: any[] = [bondAddress, accountAddressOwner, amount];

        logger.info(`INITIALIZING SERVICES    --     deposit`);

        initContractsService(logger, contracts, config, "ALASTRIA");

        const result: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressVault, methodName, newArgs, options);

        if (result && "status" in result && result.status === 1) {


            const contractName: string = "RepresentativeBondTokenFactory";
            const methodName: string = "createRepresentativeBondToken";
            const contractAddressRepresentative: string = config.CONTRACT.ADDRESS_REPRESENTATIVE_BOND_TOKEN;

            logger.info(`INITIALIZING SERVICES    --     createRepresentativeBondToken`);

            const representativeArgs: any[] = [tokenName, tokenSymbol, apiWalletPublic, bondAddress, accountAddressOwner, priceToken ];

            initContractsService(logger, contracts, config, "AMOY");
           
            const resultAmoy: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressRepresentative, methodName, representativeArgs, options);
            let addressTokenAmoy = "";

            if (resultAmoy && 'logs' in resultAmoy && resultAmoy.logs.length > 0) {

                // esto hay q devolverlo para guardarlo en el mongo --> se manda en la siguiente llamada. 
                addressTokenAmoy = resultAmoy.logs[0].address;

                logger.info(`account amoy: ${resultAmoy.logs[0].address}`);
                logger.info(`INITIALIZING SERVICES    --    Mint in amoy representative tokens`);

                const contractName: string = "RepresentativeBondToken";
                const methodName: string = "mint";

                const mintRepresentativeArgs: any[] = [accountAddressOwner, amount];

                initContractsService(logger, contracts, config, "AMOY");
                const resultTokenMint: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, addressTokenAmoy, methodName, mintRepresentativeArgs, options);

                return {
                    statusCode: 201,
                    body: {
                        message: resultTokenMint instanceof ContractTransactionReceipt ? 'Transaction executed' : 'Transacion processed',
                        resultTokenMint
                    }
                }

            } else {
                return {
                    statusCode: 500,
                    body: {
                        message: "create bond in amoy Error"
                    }
                }
            }           

        } else {
            return {
                statusCode: 500,
                body: {
                    message: "lock in vault Error"
                }
            }
        }       

    } else {
        return {
            statusCode: 500,
            body: {
                message: "approve error"
            }
        }
    }  
   
}

export async function burn(req: Request): Promise<AppResult> {
    // validar en la app de petre la cantidad a desbloqeuar q sea = min al max
   // const contractName: string = "RepresentativeBondToken"; 
   // const methodName: string = "burnFrom";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;

    const contractName: string = "Account";
    const methodName: string = "transferERC20";
    const bondRepresentativeAddress: string = args[0];  // el contrato de la red donde queremos hacer el swap (origin)
    const amount: string = args[1];  
    const network: string = args[2];  // red desde la q vamos a swapear
    const companyAddress: string = args[3]; // la direccion del owner q se genera en createAccount
    const bondAddress: string = args[4];  // el contrato q se genera en createBond
    const burnAddress: string ="0x000000000000000000000000000000000000dEaD";

    const burnArgs: any[] = [bondRepresentativeAddress, burnAddress ,amount];


    logger.info(`INITIALIZING SERVICES  ---      BURN`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, network);

    const resultBurn: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, companyAddress, methodName, burnArgs, options);
    if (resultBurn && "status" in resultBurn && resultBurn.status === 1) {

        const contractName: string = "Vault";
        const methodName: string = "withdraw";
        logger.info(`INITIALIZING SERVICES  ---    UNLOCK`);

        const unlockArgs: any[] = [bondAddress, companyAddress, amount];

        initContractsService(logger, contracts, config, "ALASTRIA");
        const resultUnlock: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressVault, methodName, unlockArgs, options);

        return {
            statusCode: 201,
            body: {
                message: resultUnlock instanceof ContractTransactionReceipt ? 'Transaction executed' : 'Transacion processed',
                resultUnlock
            }
        }
    } else {
        return {
            statusCode: 500,
            body: {
                message: "burn error"
            }
        }
    }
   
}
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function initContractController(_logger: Logger, _config: Config) {
  logger = _logger;
  config = _config;
}