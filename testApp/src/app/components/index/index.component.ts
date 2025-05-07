import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlockchainService } from '../../services/blockchain.service';
import { StateService } from '../../services/state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  loading = false;
  error = '';
  showAccounts = false;
  companyName = '';

  mockAccounts = [
    { address: '0xA1b2c3d4e5f678901234567890abcdef12345678', createdAt: new Date().toISOString() },
    { address: '0xB2c3d4e5f678901234567890abcdef1234567890', createdAt: new Date().toISOString() },
    { address: '0xC3d4e5f678901234567890abcdef1234567890ab', createdAt: new Date().toISOString() }
  ];

  constructor(
    private blockchain: BlockchainService,
    private state: StateService,
    private router: Router
  ) { }

  async createCompany() {
    this.loading = true;
    this.error = '';
    try {
      const wallet = await this.blockchain.createCompany(this.companyName);
      this.state.setWallet(wallet);
      this.router.navigate(['/admin-panel']);
    } catch (err: any) {
      this.error = 'Error al crear la cuenta';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  toggleAccountList() {
    this.showAccounts = !this.showAccounts;
  }

  loadAccount(account: any) {
    this.state.setWallet({
      address: account.address,
      createdAt: new Date(account.createdAt)
    });
    this.router.navigate(['/admin-panel']);
  }
}
