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
                    // Convertir el precio del bono a una cadena con coma decimal
                    const bondPriceFormatted = bondPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.');
                    // Convertir de nuevo a número
                    const bondPriceNumber = parseFloat(bondPriceFormatted);
                    return bondPriceNumber;
                }
            }
        } catch (err) {
            console.error('Error calculateBondPrice() :: ', err);
            return null;
        }
    };


    const getBondNetWorkAccount = async (accounts: any[], network: string) => {
        try {
            for (const account of accounts) {
                if (account.network === network) {
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




