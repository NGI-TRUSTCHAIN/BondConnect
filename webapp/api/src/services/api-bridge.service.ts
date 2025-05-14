// src/services/apiBridgeService.ts
import { environment } from '../enviroments/environment'; // ajusta la ruta según tu estructura
import { CreateBondResponse } from '../models/company.model';

const baseUrl = environment.HOST_BRIDGE;
const apiKey = environment.PRIVATE_API_KEY_SMART_ACCOUNT;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': apiKey,
};

async function post<T = any>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ args: Object.values(body) }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

async function get<T = any>(endpoint: string, params: object): Promise<T> {
  // Construye la URL con los parámetros
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = `${baseUrl}${endpoint}?${queryString}`;
  console.log("baseUrl: " + baseUrl + " endpoint: " + endpoint + " queryString: " + queryString);
  const response = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

export const useApiBridge = {
  async createBond(name: string, symbol: string, price: number, wallet: string): Promise<CreateBondResponse> {
    return await post('/createBond', { name, symbol, price, wallet });
  },

  async mintBond(bondAddress: string, toWallet: string, amount: number): Promise<CreateBondResponse> {
    return await post('/mintBond', { bondAddress, toWallet, amount });
  },

  async balance(bondAddress: string, accountAddressOwner: string, network: string): Promise<CreateBondResponse> {
    return await get('/balance', { bondAddress, accountAddressOwner, network });
  },

  async bridge(
    bondAddress: string,
    wallet: string,
    creditAmount: number,
    bondName: string,
    bondSymbol: string,
    bondPrice: number
  ): Promise<CreateBondResponse> {
    return await post('/bridge', {
      bondAddress,
      wallet,
      creditAmount,
      bondName,
      bondSymbol,
      bondPrice
    });
  },

  async withdraw(
    amoyAddress: string,
    amount: number,
    network: string,
    wallet: string,
    bondWallet: string
  ): Promise<CreateBondResponse> {
    return await post('/burn', { amoyAddress, amount, network, wallet, bondWallet });
  },
};
