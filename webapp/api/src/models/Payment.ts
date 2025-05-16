export interface UserInfo {
    purchaseBond: PurchaseBond[];
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
// a�adir un timeStamp de cuando se creo 
// a�adir 