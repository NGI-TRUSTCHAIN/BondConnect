export interface Bond {
    _id: string | undefined;
    bondName: string; // Name of the bond
    bondStartDate: Date | undefined; // Satrt date of the bond
    bondMaturityDate: Date | undefined; // Maturity date of the bond
    bondPurpose: string; // Purpose of creating the bond
    interestRate: number | undefined; // Annual interest rate in percentage
    paymentFreq: string; // Frequency of coupon payments
    goalAmount: number | undefined; // Total amount to raise
    numberTokens: number | undefined; // Number of tokens to issue
    earlyRedemptionClauses: string; // Whether early redemption is allowed
    penalty: number | undefined; // Penalty percentage for early redemption
    // redemptionPeriods: string; // Redemption periods, if applicable
    redemptionStartDate: Date | undefined // Early redemption start date
    redemptionFinishDate: Date | undefined // Early redemption final date
    blockchainNetwork: string; // Selected blockchain network
    otherBlockchainNetwork: string | undefined; // Custom blockchain network, if "Other" is selected
    walletAddress: string; // Wallet address for bond management
    tokenState: TokenState[];
    creatorCompany: string | undefined
};

export interface TokenState{
    blockchain: string;
    amount: number
}