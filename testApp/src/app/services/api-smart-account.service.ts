// src/app/services/api-smart-account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../enviroments/environment';
import { CompanyWallet, CreateAccountResponse, SmartAccount } from '../models/company.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiSmartAccountService {
  private baseUrl = environment.HOST_SMART_ACCOUNT;
  private apiKey = environment.PRIVATE_API_KEY_SMART_ACCOUNT;

  constructor(private http: HttpClient) { }

  // Smart accounts conection

  createAccount(saltHex: string): Observable<any> {
    const url = `${this.baseUrl}/createAccount`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    });

    const body = {
      args: [saltHex]
    };

    return this.http.post(url, body, { headers });
  }


  createAccountSimple(salt: string, network: string): Observable<any> {
    const url = `${this.baseUrl}/createIndividualAccountRetry`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    });

    const body = {
      args: [salt, network]
    };

    return this.http.post(url, body, { headers });
  }
}
