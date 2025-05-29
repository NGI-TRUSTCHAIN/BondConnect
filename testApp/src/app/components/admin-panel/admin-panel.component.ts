// src/app/components/admin-panel/admin-panel.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { BlockchainService } from '../../services/blockchain.service';
import { FormsModule } from '@angular/forms';
import { ApiSmartAccountService } from '../../services/api-smart-account.service';
import { ApiBridgeService } from '../../services/api-bridge.service';
import { CompanyWallet, CreateAccountResponse, SmartAccount, CreateBondResponse, BondAccountInfo  } from '../../models/company.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  wallet = '';
  tokensBSC = 0;
  creditAmount = 0;
  tokensBridge = 0;
  accounts: SmartAccount[] = [];

  showModal = false;
  showInput = false;
  txHash = '';

  bonds: BondAccountInfo[] = [];
  bondInfo: BondAccountInfo = {   
    network: '',
    address: '',
    name: '',
    symbol: '',
    price: 0,
    tokens:0
  };
  salt = '';

  mintQty = 0;
  bonosQty = 0;
  convertQty = 0;
  bridgeQty = 0;
  receiveQty = 0;

  isGenerating: boolean = false;
  isGeneratingToken: boolean = false;
  showBondForm: boolean = false;
  bondName: string = '';
  bondSymbol: string = '';
  bondPrice: number | null = null;
  bondWallet: string = '';

  // Para almacenar los contratos generados
  createdBonds: { address: string; network: string }[] = [];
  mintToken: { network: string, trx: string; qty: number }[] = [];
  trxMintToken: {network: string, trx: string; qty: number } = {
    network:'',
    trx: '',
    qty: 0
  };


  constructor(
    private state: StateService,
    private blockchain: BlockchainService,
    private apiBridge: ApiBridgeService,
    private apiSmart: ApiSmartAccountService
  ) { }

  ngOnInit(): void {
    const w = this.state.currentWallet;
    if (!w) return;

    this.wallet = w.address;
    this.accounts = w.accounts || [];
    this.salt =  ''; // por si viene del flujo anterior
   
    this.loadBalances();

    const alastria = this.accounts.find(a => a.network === 'ALASTRIA');
    if (alastria?.address) {
      this.bondWallet = alastria.address;
    }

  }

  isMissing(account: SmartAccount): boolean {
    return !account.address || account.address === '';
  }

  async retryAccount(network: string) {
    try {
      const response: CreateAccountResponse = await this.apiSmart.createAccountSimple(this.salt, network).toPromise();
      const updated = response.accounts?.find(a => a.network === network);
      if (!updated || !updated.address) return;

      const i = this.accounts.findIndex(a => a.network === network);
      if (i !== -1) this.accounts[i] = updated;
    } catch (err) {
      console.error('Error al reintentar', err);
    }
  }

  getExplorerUrl(network: string, txHash: string): string {
    const explorers: Record<string, string> = {
      ALASTRIA: 'https://b-network.alastria.izer.tech/tx/',
      AMOY: 'https://amoy.polygonscan.com/tx/'
    };

    const base = explorers[network.toUpperCase()] || '';
    return base + txHash;
  }

  toggleBondForm(): void {
    this.showBondForm = !this.showBondForm;
  }

  async createBond() {
    this.isGenerating = true;
    if (!this.bondName || !this.bondSymbol || !this.bondPrice || !this.bondWallet) return ;

    try {

      const response: CreateBondResponse = await this.blockchain.createBond(this.bondName,
        this.bondSymbol,
        this.bondPrice,
        this.bondWallet);
       
      const bond = response.accounts?.find(a => a.network === 'ALASTRIA');
      if (!bond || !bond.address) return;

      console.info(' bono:', bond);
      this.isGenerating = false;
      this.bondInfo.network = "ALASTRIA",
      this.bondInfo.address = bond.address;
      this.bondInfo.name = this.bondName;
      this.bondInfo.symbol = this.bondSymbol;
      this.bondInfo.price = this.bondPrice;      
      this.bondInfo.tokens = 0;      

      this.bonds.push({ ...this.bondInfo });

      this.resetBondForm();

      

    } catch (err) {
      console.error('❌ Error creando bono:', err);
    
    }
  }

  resetBondForm() {
    this.bondName = '';
    this.bondSymbol = '';
    this.bondPrice = 0;   
  }


  clearBondForm(): void {
    this.bondName = '';
    this.bondSymbol = '';
    this.bondPrice = null;  
  }



  async mintBond(bond: any, creditAmount:number) {
    this.isGeneratingToken = true;

    if (!creditAmount || creditAmount <= 0) return;

    try {
     // const trx = await this.apiBridge.mintBond(bond.address, this.wallet, creditAmount).toPromise();
    


      const trx = await this.blockchain.mintBond(bond.address,
        this.wallet,
        creditAmount);

      console.info("TRX:", trx);

      if (trx && trx.message) {

        this.trxMintToken.network = "ALASTRIA";
        this.trxMintToken.trx = trx.message;
        this.trxMintToken.qty = creditAmount;
        console.info("TRX updated:", this.trxMintToken.trx);

        this.mintToken.push({ ...this.trxMintToken });

        this.bonds = this.bonds.map(bondItem => {
          if (bondItem.address === bond.address) {
            return {
              ...bondItem,
              tokens: (bondItem.tokens || 0) + creditAmount
            };
          }
          return bondItem;
        });
      }

      //await this.loadBalances();
      this.creditAmount = 0;
      this.showInput = false;
      this.isGeneratingToken = false;
    } catch (err) {
      console.error("❌ Error al mintear bonos:", err);
    }
  }

 
  async loadBalances() {
    if (!this.wallet) return;
    this.tokensBSC = await this.blockchain.getBSCBalance(this.wallet);
  //  this.tokensBridge = await this.blockchain.getBridgeBalance(this.wallet);
  }

}
