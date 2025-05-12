import { CreateBondResponse } from "models/company.model";

//Funciones dinamicas para calculos (Dinero anual) Numero anual tokens...
export const useBusinessService = () => {
    const calculateBondPrice = async (bond: any) => {
        console.log("Call calculateBondPrice()", bond);

        try {
            if (!bond) return;
            const goalAmount = bond.goalAmount;
            const numberTokens = bond.numberTokens;

            if (goalAmount && numberTokens) {
                const bondPrice = goalAmount / numberTokens;
                console.log('Bond price: ' + bondPrice);
                if (bondPrice) {
                    return bondPrice;
                }
            }
        } catch (err) {
            console.error('Error calculateBondPrice() :: ', err);
            return null;
        }

    };

    const getBondNetWorkAccount = async (accounts: any[], network: string) => {
        console.log("Call getBondNetWorkAccount() ::: Accounts: " +  accounts + " Network: " + network);
        try {
            for (const account of accounts) {
                console.log("\nAddress: " + account.address);
                console.log("\nNetwork: " + network);
                if(account.network === network.toUpperCase()){
                    return account.address;
                }
            }
            return null;
        } catch (err) {
            console.error('Error getBondAccounts() :: ', err);
            return null;
        }
    };

    return {
        calculateBondPrice,
        getBondNetWorkAccount
    };
};




