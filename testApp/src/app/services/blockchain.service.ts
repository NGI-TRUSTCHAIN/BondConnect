import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { CompanyWallet, CreateAccountResponse, SmartAccount,CreateBondResponse } from '../models/company.model';
import { environment } from '../../enviroments/environment';
import { ApiSmartAccountService } from './api-smart-account.service'; // Importar correctamente
import { ApiBridgeService } from '../services/api-bridge.service';

@Injectable({ providedIn: 'root' })
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private signer!: ethers.Wallet;
  private bscRpcUrl = environment.BSC_RPC_URL;
  private tokenContractAddress = environment.TOKEN_CONTRACT_BSC;
  private bridgeVaultAddress = environment.BRIDGE_VAULT;
  private polygonContractAddress = environment.TOKEN_CONTRACT_POLYGON;
  private host = environment.TOKEN_CONTRACT_POLYGON;

  constructor(private apiSmartAccount: ApiSmartAccountService, private apiBridge: ApiBridgeService,) {    
    this.provider = new ethers.JsonRpcProvider(this.bscRpcUrl);
  }

  private mockBalance = 0;
  private bridgeBalance = 0;


  async createCompany(companyName: string): Promise<CompanyWallet> {

    /*
      1. Esta llamada representa la creacion dela cuenta de la empresa.
      2. Primero se dará de alta en la BBDD (el formulario desde la app)
      3. La creacion de la cuenta generará un id único q hace referencia a ese cliente.
      4. Este id, será conocido como SALT, tendremos que aplicarle un ecrypt Byte32
      5. Llamaremos a la API  /createAccount pasandole el parámetro.
      6. Si la respuesta es correcta devolverá una lista de SmartAccount
      7. habra q comprobar si la lista no viene ninguna Address vacia, en este caso deberemos guardarla en una lista para volver a hacer el reintento.
      8. Si el reintento falla, se lanzará una alerta, para que servicio técnico pueda arreglarlo.
      9. Tras la gestion del fallo si lo hubo, persistiremos en mongoDB el resultado. 
    */
    
    const saltHex = ethers.encodeBytes32String(companyName);
    console.log(' Salt generada:', saltHex);

    try {
      const response: CreateAccountResponse = await this.apiSmartAccount.createAccount(saltHex).toPromise();

      const accounts: SmartAccount[] = response?.accounts ?? [];

      const missingAccounts: SmartAccount[] = accounts.filter(acc =>
        !acc.address || acc.address.trim() === '' );

      console.log(' Cuentas creadas:', accounts.length);
      console.log(' Cuentas faltantes:', missingAccounts.length);

      for (const acc of missingAccounts) {
        // call this.apiSmartAccount.retryAccountSimple(acc.network, salt, ...)
      }

      return {
        address: accounts[0]?.address || '0x0000000000000000000000000000000000000000',
        createdAt: new Date(),
        accounts
      };
    } catch (err) {
      console.error(' Error al crear cuenta en backend:', err);

      return {
        address: '0x' + Math.floor(Math.random() * 1e16).toString(16).padStart(40, '0'),
        createdAt: new Date(),
        accounts: []
      };
    }
  }


  async createBond(bondName: string, bondSymbol: string, bondPrice: number, bondWallet: string): Promise<CreateBondResponse> {

    /*
      1. Esta llamada representa la creacion de un bono en la red de Alastria
      2. Primero se dará de alta en la BBDD (el formulario desde la app)
      3. Tras la confirmacion del alta, extraeremos los datos necesarios para la creacion
       3.1 bondName --> nombre que se le dará al bono
       3.2 bondSymbol -->  nombre del symbolo del bono
       3.3 bondPrice -->  precio que tendra los tokens que se minten a partir de este bono
       3.4 bondWallet --> La direccion creada inicialmente cuando se creo la cuenta. Es la direccion de la cuenta en Alastria
      4. El resultado de esta llamada devolverá una direccion, dicha direccion es el contrato del bono que acabamos de crear
      5. Deremos persistir este bono dentro de la BBDD para usarlo a futuro. 
    */

    const response: CreateBondResponse = await this.apiBridge.createBond(
      bondName,
      bondSymbol,
      bondPrice,
      bondWallet
    ).toPromise();

    return response;
  }

  async mintBond(bondAddress: string, wallet: string, creditAmount: number): Promise<CreateBondResponse> {

    /*
       1. Esta llamada representa la creacion de un token en la red de Alastria, teniendo un bono previamente creado.
       2. Para realizar esta llamada necesitaremos extraer de la BBDD la dirección del contrato del bono y la direccion de Alastria de la cuenta del cliente
         2.1 bondAddress --> hace referencia a la direccion del contrato donde mintearemos tokens.
         2.2.wallet --> necesitaremos la wallet de la cuenta del cliente
         2.3 creditAmount --> la cantidad e tokens a mintear
       3. El resultado de esta llamada sera una transaccion que se podra verificar.
       4. Esta trx habrá que persistirla en la BBDD.
       5. Dentro del usuario necesitaremos tener un registro de los minteos en los que deberia al menos guardarse, qty trx y direccion del contrato. 
    */
    const response: CreateBondResponse = await this.apiBridge.mintBond(
      bondAddress,
      wallet,
      creditAmount
    ).toPromise();

    return response;
  }

  async bridge(bondAddress: string, wallet: string, creditAmount: number, bondName: string, bondSymbol: string, bondPrice: number): Promise<CreateBondResponse> {

    /*  Esta llamada tarda bastante en ejecutarse. --> hace muchas llamadas internas. 
       1. Esta llamada representa el bridge de un token en la red de Amoy, teniendo los tokens previamente creados.(se bloquearan en Alastria y se crearan en Amoy)
       2. Para realizar esta llamada necesitaremos extraer de la BBDD la dirección del contrato del bono y la direccion de Alastria de la cuenta del cliente
         2.1 bondAddress --> hace referencia a la direccion del contrato donde mintearemos tokens.
         2.2.wallet --> necesitaremos la wallet de la cuenta del cliente
         2.3 creditAmount --> la cantidad e tokens a mintear
         ¡¡IMPORTANTE!!
         2.4 bondName --> nombre que se le dio al bono CUANDO se creo en ALASTRIA
         2.5 bondSymbol -->  nombre del symbolo del bono CUANDO se creo en ALASTRIA
         2.6 bondPrice -->  precio del token CUANDO se creo en ALASTRIA
         ¡¡IMPORTANTE!!
       3. El resultado de esta llamada sera una direccion, que será el contrato generado en la red de destino (AMOY en este caso)
       4. Esta direccion habrá que persistirla en la BBDD.    
    */
    const response: CreateBondResponse = await this.apiBridge.bridge(
      bondAddress,
      wallet,
      creditAmount,
      bondName,
      bondSymbol,
      bondPrice
    ).toPromise();

    return response;
  }

  async withdraw(amoyAddress: string, amount: number, network: string, wallet: string, bondWallet: string): Promise<CreateBondResponse> {

    /*
       1. Esta llamada representa la recuperacion de los token de Alastria, quemando los tokens que se generaron en la red de Amoy
       2. Para realizar esta llamada necesitaremos extraer de la BBDD la siguiente informacion
         2.1 amoyAddress --> hace referencia a la direccion del contrato cuando hicimos el bridge.
         2.2.amount --> la canmtidad de tokens a desbloquear en ALASTRIA
         2.3 network --> red desde la que quemaremos los tokens. 
         2.4 wallet --> wallet del cliente en ALASTRIA(la misma en todas las redes)
         2.5 bondWallet--> direccion del contrato del bono original donde se minteo los tokens en ALASTRIA
         
       3. El resultado de esta llamada sera una transaccion que se podra verificar.
       4. Esta trx habrá que persistirla en la BBDD.     
    */
    const response: CreateBondResponse = await this.apiBridge.withdraw(
      amoyAddress,
      amount,
      network,
      wallet,
      bondWallet      
    ).toPromise();

    return response;
  }


  async getBSCBalance(address: string): Promise<number> {
    console.log(`Mock get balance for ${address}`);
    return this.mockBalance;
  }

  async bridgeTokens(toPolygon: boolean, qty: number): Promise<boolean> {
    if (toPolygon) {
      console.log(`Mock bridge out ${qty}`);
      this.mockBalance -= qty;
      this.bridgeBalance += qty;
    } else {
      console.log(`Mock bridge in ${qty}`);
      this.mockBalance += qty;
      this.bridgeBalance -= qty;
    }
    return true;
  }
}
