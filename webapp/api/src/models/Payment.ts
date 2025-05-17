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
}
