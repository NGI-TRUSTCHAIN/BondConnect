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


  logger.info(`INITIALIZING SERVICES`); 
  const contracts = await loadAllContracts(config, logger);
 //initContractsService(logger, contracts, config);

  const result: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, args, options, "ALASTRIA");

  return {
    statusCode: 201,
    body: {
      message: result instanceof ContractTransactionReceipt ? 'Transaction executed' : 'Transacion processed',
      result
    }
  }
}
/**
 * @swagger
 * /createBond:
 *   post:
 *     summary: Create a new Bond
 *     tags: [Bond]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Bond create sucessfully
 */

export async function createBond(req: Request): Promise<AppResult> {
    const contractName: string = "BondFactory";
    const contractAddress: string = config.CONTRACT.ADDRESS_BOND;    
    const methodName: string = req.params.method;
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    let transactionHash = null;
    const results: { network: string; transactionHash: string | null; address: string | null }[] = [];

    logger.info(`Start CreateBond  in Alastria `);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, "ALASTRIA");


    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, args, options, "ALASTRIA");

    if (resultAlastria && 'logs' in resultAlastria && resultAlastria.logs.length > 0) {
        const address = resultAlastria.logs[0].address;
        transactionHash = resultAlastria.hash; 
        results.push({ network: "ALASTRIA", transactionHash, address });
    } else {     
        results.push({ network: "ALASTRIA", transactionHash: resultAlastria?.hash ?? null, address: null });
    }

    return {
        statusCode: 201,
        body: {
            message: "Transactions executed successfully",
            accounts: results,
        },
    };
}

/**
 * @swagger
 * /balance:
 *   post:
 *     summary: Get the balance of a bond token
 *     tags: [Bond]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [bondAddress, accountAddressOwner, network]
 *     responses:
 *       201:
 *         description: Returns the token balance
 */
export async function balance(req: Request): Promise<AppResult> {
  
    const methodName: string = "balanceOf";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
      
    const bondAddress: string = args[0];
    const accountAddressOwner: string = args[1];

    const network: string = args[2];

    let contractName: string = "";

    if (network === "ALASTRIA") {
        contractName = "Bond";
    }
    if (network === "AMOY") {
        contractName = "RepresentativeBondToken";
    }

    const results: { network: string; address: string | null }[] = [];

    logger.info(`Start GetBalance`); 

    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [accountAddressOwner];

    initContractsService(logger, contracts, config, network);
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, bondAddress, methodName, newArgs, options, network);

    return {
        statusCode: 201,
        body: {
            message: resultAlastria            
        }
    }
}
/**
 * @swagger
 * /mintBond:
 *   post:
 *     summary: Mint bond tokens
 *     tags: [Bond]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [bondAddress, accountOwnerAddress, amount]
 *     responses:
 *       201:
 *         description: Mint transaction hash
 */
export async function mintBond(req: Request): Promise<AppResult> {   
    const contractName: string = "Bond";    
    const methodName: string = "mint";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

   
    const bondAddress: string = args[0];
    const accountAddressOwner: string = args[1];
    const amount: string = args[2];

    const results: { network: string; address: string | null }[] = [];     
    logger.info(` mintBond`); 
    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [accountAddressOwner, amount];

    initContractsService(logger, contracts, config, "ALASTRIA" );
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, bondAddress, methodName, newArgs, options, "ALASTRIA");
       
    const transactionHash = resultAlastria && 'hash' in resultAlastria ? resultAlastria.hash : 'N/A';


    return {
        statusCode: 201,
        body: {
            message: transactionHash             
        }
    }
}
/**
 * @swagger
 * /bridge:
 *   post:
 *     summary: Bridge bond tokens between networks
 *     tags: [Bond]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [bondAddress, accountOwner, amount, tokenName, tokenSymbol, priceToken]
 *     responses:
 *       201:
 *         description: Representative token created and minted on target network
 */
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
    logger.info(`Start     --       ApproveERC20`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, "ALASTRIA");

    const resultApprove: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractNameApprove, contractAddressApprove, methodNameApprove, approveArgs, options, "ALASTRIA");

    if (resultApprove && 'status' in resultApprove && resultApprove.status === 1) {
        logger.info("Approve transaction succeeded. Waiting 10 seconds...");

        await delay(10_000); // espera 10s (10,000 ms)

        // Llama a la siguiente función
        const contractName: string = "Vault";
        const methodName: string = "deposit";
        const newArgs: any[] = [bondAddress, accountAddressOwner, amount];

        logger.info(`Start    --     Deposit`);

        initContractsService(logger, contracts, config, "ALASTRIA");

        const result: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressVault, methodName, newArgs, options, "ALASTRIA");

        if (result && "status" in result && result.status === 1) {


            const contractName: string = "RepresentativeBondTokenFactory";
            const methodName: string = "createRepresentativeBondToken";
            const contractAddressRepresentative: string = config.CONTRACT.ADDRESS_REPRESENTATIVE_BOND_TOKEN;

            logger.info(`Start    --     createRepresentativeBondToken`);

            const representativeArgs: any[] = [tokenName, tokenSymbol, apiWalletPublic, bondAddress, accountAddressOwner, priceToken ];

            initContractsService(logger, contracts, config, "AMOY");
           
            const resultAmoy: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressRepresentative, methodName, representativeArgs, options, "AMOY");
            let addressTokenAmoy = "";

            if (resultAmoy && 'logs' in resultAmoy && resultAmoy.logs.length > 0) {

                // esto hay q devolverlo para guardarlo en el mongo --> se manda en la siguiente llamada. 
                addressTokenAmoy = resultAmoy.logs[0].address;
                const transactionHash = resultAmoy && 'hash' in resultAmoy ? resultAmoy.hash : 'N/A';
                logger.info(`account in seco amoy: ${resultAmoy.logs[0].address}`);
                logger.info(`Start    --    Mint in amoy representative tokens`);

                const contractName: string = "RepresentativeBondToken";
                const methodName: string = "mint";

                const mintRepresentativeArgs: any[] = [accountAddressOwner, amount];

                initContractsService(logger, contracts, config, "AMOY");
                const resultTokenMint: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, addressTokenAmoy, methodName, mintRepresentativeArgs, options, "AMOY");

                return {
                    statusCode: 201,
                    body: {
                        message: transactionHash,
                        contract: addressTokenAmoy
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
/**
 * @swagger
 * /requestTransfer:
 *   post:
 *     summary: Transfer ERC20 tokens between accounts
 *     tags: [Transfer]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [toAddress, fromAddress, amount, network, contractAddress]
 *     responses:
 *       201:
 *         description: Transfer transaction hash
 */
export async function requestTransfer(req: Request): Promise<AppResult> {
 
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;

    const toAddress: string = args[0];  // token  addreess to
    const fromAddress: string = args[1];// token  from to
    const amount: string = args[2];  // amount
    const network: string = args[3];  // network 
    const contractAddress: string = args[4]; // la direccion del owner q se genera en createAccount
  

    const contractName: string = "Account";
    const methodName: string = "transferERC20";   

    const burnArgs: any[] = [contractAddress,toAddress, amount];

    logger.info(`Start  ---      Transfer`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, network);

    const resultBurn: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, fromAddress, methodName, burnArgs, options, network);
    if (resultBurn && "status" in resultBurn && resultBurn.status === 1) {

        const transactionHash = resultBurn && 'hash' in resultBurn ? resultBurn.hash : 'N/A';
        return {
            statusCode: 201,
            body: {
                message: transactionHash               
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
/**
 * @swagger
 * /burn:
 *   post:
 *     summary: Burn representative bond tokens and unlock collateral
 *     tags: [Bond]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [bondRepresentativeAddress, amount, network, companyAddress, bondAddress]
 *     responses:
 *       201:
 *         description: Burn and unlock transaction hash
 */
export async function burn(req: Request): Promise<AppResult> {

    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;

    const contractName: string = "Account";
    const methodName: string = "burnERC20";
    const bondRepresentativeAddress: string = args[0];  //contract adrees network swap (origin)
    const amount: string = args[1];  
    const network: string = args[2];  // network from
    const companyAddress: string = args[3]; // adddress of owner createAccount
    const bondAddress: string = args[4];  // contract address generate in createBond


    const burnArgs: any[] = [bondRepresentativeAddress, amount];

    logger.info(`Start  ---      BURN`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, network);

    const resultBurn: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, companyAddress, methodName, burnArgs, options, "AMOY");
    if (resultBurn && "status" in resultBurn && resultBurn.status === 1) {

        const contractName: string = "Vault";
        const methodName: string = "withdraw";
        logger.info(`Start  ---    UNLOCK`);

        const unlockArgs: any[] = [bondAddress, companyAddress, amount];
        logger.info(`Start  ---    UNLOCK`);
        initContractsService(logger, contracts, config, "ALASTRIA");
        const resultUnlock: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressVault, methodName, unlockArgs, options, "ALASTRIA");
        const transactionHash = resultUnlock && 'hash' in resultUnlock ? resultUnlock.hash : 'N/A';
       
        return {
            statusCode: 201,
            body: {
                message: transactionHash                
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
/**
 * @swagger
 * /faucet:
 *   post:
 *     summary: Mint stable coins for testing (faucet)
 *     tags: [StableCoin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [toAddress, amount]
 *     responses:
 *       201:
 *         description: Faucet mint transaction result
 */
export async function faucet(req: Request): Promise<AppResult> {
    const contractName: string = "StableCoin";
    const methodName: string = "mint";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    // este es el caller de la function
    const toAddress: string = args[0];
    const amount: number = args[1];

    // SIEMPRE EN ALASTRIA 
    const results: { network: string; address: string | null }[] = [];

    logger.info(`Faucet `);

    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [toAddress, amount];

    initContractsService(logger, contracts, config, "ALASTRIA");

    const contractAddress = config.CONTRACT.STABLECOIN_ALASTRIA;

    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");

    return {
        statusCode: 201,
        body: {
            message: resultAlastria,
            resultAlastria
        }
    }
}
/**
 * @swagger
 * /getFaucetBalance:
 *   post:
 *     summary: Get faucet stable coin balance of an address
 *     tags: [StableCoin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [address]
 *     responses:
 *       201:
 *         description: Current stable coin balance
 */
export async function getFaucetBalance(req: Request): Promise<AppResult> {
    const contractName: string = "StableCoin";
    const methodName: string = "balanceOf";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    // este es el caller de la function
    const toAddress: string = args[0];

    // SIEMPRE EN ALASTRIA 
    const results: { network: string; address: string | null }[] = [];

    logger.info(`Faucet `);

    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [toAddress];

    initContractsService(logger, contracts, config, "ALASTRIA");
    const contractAddress = config.CONTRACT.STABLECOIN_ALASTRIA;

    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");
    
    return {
        statusCode: 201,
        body: {
            message: resultAlastria            
        }
    }
}
/**
 * @swagger
 * /requestStable:
 *   post:
 *     summary: Transfer stable coins between accounts
 *     tags: [StableCoin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               args:
 *                 type: array
 *                 description: [toAddress, fromAddress, amount]
 *     responses:
 *       201:
 *         description: Stable coin transfer transaction hash
 */
export async function requestStable(req: Request): Promise<AppResult> {

    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;

    const toAddress: string = args[0];  // to
    const fromAddress: string = args[1];// from 
    const amount: string = args[2];  // amount

    const network: string = "ALASTRIA"; // red 
    const contractAddress: string =  config.CONTRACT.STABLECOIN_ALASTRIA; 
    

    const contractName: string = "Account";
    const methodName: string = "transferERC20";

    const burnArgs: any[] = [contractAddress, toAddress, amount];

    logger.info(`Start  ---      Transfer`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, network);

    const resultBurn: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, fromAddress, methodName, burnArgs, options, "ALASTRIA");
    if (resultBurn && "status" in resultBurn && resultBurn.status === 1) {

        const transactionHash = resultBurn && 'hash' in resultBurn ? resultBurn.hash : 'N/A';
        return {
            statusCode: 201,
            body: {
                message: transactionHash
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