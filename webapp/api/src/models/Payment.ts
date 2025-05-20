export interface UserInfo {
    tokenList: PurchaseBond[];
    upcomingPayment: UpcomingPayment[];
}
export interface UpcomingPayment{
    bondName: string;    
    paymentDate: string;
    paymentAmount: number;
}

export interface PurchaseBond {
    bondName: string;   
    network: string; 
    amountAvaliable: number;
    price: number;
}

export interface Payment {
    bondName: string;
    bondId: string;
    network: string;
    amount: number;
    investors: Investors[]
}
export interface Investors {
    userId: string;
    amount: number;
    paid: boolean;
}
