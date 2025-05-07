import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyWallet } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class StateService {
  private walletSubject = new BehaviorSubject<CompanyWallet | null>(this.getWalletFromStorage());
  wallet$ = this.walletSubject.asObservable();

  constructor() { }

  private getWalletFromStorage(): CompanyWallet | null {
    const data = localStorage.getItem('company_wallet');
    return data ? JSON.parse(data) : null;
  }

  setWallet(wallet: CompanyWallet) {
    localStorage.setItem('company_wallet', JSON.stringify(wallet));
    this.walletSubject.next(wallet);
  }

  clearWallet() {
    localStorage.removeItem('company_wallet');
    this.walletSubject.next(null);
  }

  get currentWallet(): CompanyWallet | null {
    return this.walletSubject.value;
  }
}
