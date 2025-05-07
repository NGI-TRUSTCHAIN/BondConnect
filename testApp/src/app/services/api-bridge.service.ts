// src/app/services/api-smart-account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../enviroments/environment';
import { CompanyWallet, CreateAccountResponse, SmartAccount, CreateBondResponse, BondAccount } from '../models/company.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiBridgeService {
  private baseUrl = environment.HOST_BRIDGE;
  private apiKey = environment.PRIVATE_API_KEY_SMART_ACCOUNT;

  constructor(private http: HttpClient) { }


  createBond(name: string, symbol: string, price: number, wallet: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const body = {
      args: [name, symbol, price, wallet]
    };

    return this.http.post(
      `${this.baseUrl}/createBond`,
      body,
      { headers }
    );
  }

  mintBond(bondAddress: string, toWallet: string, amount: number): Observable<any> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const body = {
      args: [bondAddress, toWallet, amount]
    };

    return this.http.post(`${this.baseUrl}/mintBond`, body, { headers });
  }

  bridge(bondAddress: string, wallet: string, creditAmount: number, bondName: string, bondSymbol: string, bondPrice:number): Observable<any> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const body = {
      args: [bondAddress, wallet, creditAmount, bondName, bondSymbol, bondPrice ]
    };

    return this.http.post(`${this.baseUrl}/bridge`, body, { headers });
  }


  withdraw(amoyAddress: string, amount: number, network: string, wallet: string, bondWallet: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const body = {
      args: [amoyAddress, amount, network, wallet, bondWallet]
    };

    return this.http.post(`${this.baseUrl}/burn`, body, { headers });
  }

 
}
