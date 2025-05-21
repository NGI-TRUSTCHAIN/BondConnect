import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Bond, TokenState } from "../Bond";
import { TransferInfo } from "../components/issuer/BlockchainTransfer";
import { PurchaseData } from "../components/issuer/BuyToken";
import { SaleReceipt } from "../components/TokenSale";
import { SettlementReceipt } from "../components/TokenSettlement";
import { MarketData } from "../components/issuer/RetailMarket";

interface BondState {
  bonds: Bond[] | null;
  retailBonds: MarketData[] | null;
  users: PurchaseData[];
  transferHistory: TransferInfo[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  tokenList: { bondName: string; network: string; amountAvaliable: number; price: number; }[] | null;
  upcomingPayment: any[] | null;
}

const initialState: BondState = {
  bonds: null,
  retailBonds: null,
  users: [],
  transferHistory: null,
  status: "idle",
  error: undefined,
  tokenList: null,
  upcomingPayment: null,
};

export const readBonds = createAsyncThunk("bond/readBonds", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/bonds/${userId}`, { method: "GET" });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log("Fetched Bonds:", data); // Debugging step
    return data as Bond[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const readUserBonds = createAsyncThunk("bond/readUserBonds",async (requestData: {userId: string, walletAddress: string}, { rejectWithValue }) => {
  try {
        const response: Response = await fetch(`/api/bonds-user`, { method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestData) });

      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data as Bond[];
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const newBond = createAsyncThunk("bond/createBond", async (formData: Bond, { rejectWithValue }) => {
  console.log("Before sending:", JSON.stringify(formData));
  try {
    const response = await fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const updateBond = createAsyncThunk("bond/updateBond", async (formData: Bond, { rejectWithValue }) => {
  console.log("Before sending:", JSON.stringify(formData));
  try {
    const response = await fetch(`/api/update/${formData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const saveBond = createAsyncThunk("bond/saveBond", async (formData: Bond, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const createTransferHistoric = createAsyncThunk(
  "bond/createTransferHistoric",
  async (transferData: TransferInfo, { rejectWithValue }) => {
    console.log("FormData before fetch:", transferData);
    try {
      const response = await fetch("/api/createTransferHistoric", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        // const error = await response.json();
        // return rejectWithValue(error.message);
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const readTransferHistory = createAsyncThunk("bond/readTransferHistory", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/transferHistory", { method: "GET" });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log("Fetched TransferHistory:", data); // Debugging step
    return data as TransferInfo[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const createSaleReceipt = createAsyncThunk(
  "bond/createSaleReceipt",
  async (saleReceipt: SaleReceipt, { rejectWithValue }) => {
    console.log("data before fetch:", saleReceipt);
    try {
      const response = await fetch("/api/createSaleReceipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleReceipt),
      });

      if (!response.ok) {
        // const error = await response.json();
        // return rejectWithValue(error.message);
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createSettlementReceipt = createAsyncThunk(
  "bond/createSettlementReceipt",
  async (settlementReceipt: SettlementReceipt, { rejectWithValue }) => {
    console.log("data before fetch:", settlementReceipt);
    try {
      const response = await fetch("/api/createSettlementReceipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settlementReceipt),
      });

      if (!response.ok) {
        // const error = await response.json();
        // return rejectWithValue(error.message);
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updatePayment = createAsyncThunk("bond/updatePayment", async (formData: {userId: string, bondId: string, network: string}, { rejectWithValue }) => {
  console.log("Before sending:", JSON.stringify(formData));
  try {
    const response = await fetch(`/api/update-payment/${formData.userId}/${formData.bondId}/${formData.network}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    } 

    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const readUsers = createAsyncThunk("bond/readUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/users", { method: "GET" });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log("Fetched Investors:", data); // Debugging step
    return data as PurchaseData[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const registerPurchase = createAsyncThunk("bond/registerPurchase", async (userData: PurchaseData, { rejectWithValue }) => {
  console.log("Before sending:", JSON.stringify(userData));
  try {
    const response = await fetch("/api/register-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const addRetailMktBond = createAsyncThunk("retailMktBond/addToMarket", async (formData: Partial<MarketData>, { rejectWithValue }) => {
    console.log("Before sending:", JSON.stringify(formData));

    try {
      const response = await fetch("/api/addToMarket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message || "Error en la red");
    }
  }
);

export const getRetailMktBonds = createAsyncThunk("retailMktBond/readAllRetailBonds", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/getAllMarketBonds", { method: "GET" });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log("Fetched RetailBonds:", data); // Debugging step
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getTokenListAndUpcomingPaymentsByIssuer = createAsyncThunk(
  "bond/getTokenListAndUpcomingPaymentsByIssuer",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bonds-issuer-tokens/${userId}`, { method: "GET" });

      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log("getTokenListAndUpcomingPaymentsByIssuer:", data);
      return {
        tokenList: data.tokenList,
        upcomingPayment: data.upcomingPayment
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getTokenListAndUpcomingPaymentsByInvestor = createAsyncThunk(
  "bond/getTokenListAndUpcomingPaymentsByInvestor",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bonds-investor-tokens/${userId}`, { method: "GET" });

      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log("getTokenListAndUpcomingPaymentsByInvestor:", data);
      return {
        tokenList: data.tokenList,
        upcomingPayment: data.upcomingPayment
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPendingPayments = createAsyncThunk("bond/getPendingPayments", async (id: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/bonds-issuer-pending/${id}`, { method: "GET" });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log("getPendingPayments:", data); // Debugging step
    return data as Bond[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

const bondSlice = createSlice({
  name: "bond",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(newBond.pending, (state) => {
        state.status = "loading";
      })
      .addCase(newBond.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(newBond.rejected, (state, action) => {
        state.status = "failed"; // Aquí capturamos el error que pasamos con rejectWithValue
        state.error = action.payload as string; // action.payload es el valor que pasamos con rejectWithValue
      })
      .addCase(updateBond.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBond.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(updateBond.rejected, (state, action) => {
        state.status = "failed"; // Aquí capturamos el error que pasamos con rejectWithValue
        state.error = action.payload as string; // action.payload es el valor que pasamos con rejectWithValue
      })
      .addCase(createTransferHistoric.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createTransferHistoric.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(createTransferHistoric.rejected, (state, action) => {
        state.status = "failed"; // Aquí capturamos el error que pasamos con rejectWithValue
        state.error = action.payload as string; // action.payload es el valor que pasamos con rejectWithValue
      })
      .addCase(createSaleReceipt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSaleReceipt.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(createSaleReceipt.rejected, (state, action) => {
        state.status = "failed"; // Aquí capturamos el error que pasamos con rejectWithValue
        state.error = action.payload as string; // action.payload es el valor que pasamos con rejectWithValue
      })
      .addCase(createSettlementReceipt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSettlementReceipt.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(createSettlementReceipt.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(saveBond.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveBond.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(saveBond.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readBonds.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readBonds.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bonds = action.payload;
      })
      .addCase(readBonds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readTransferHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readTransferHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transferHistory = action.payload;
      })
      .addCase(readTransferHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(registerPurchase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerPurchase.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(registerPurchase.rejected, (state, action) => {
        state.status = "failed"; // Aquí capturamos el error que pasamos con rejectWithValue
        state.error = action.payload as string; // action.payload es el valor que pasamos con rejectWithValue
      })
      .addCase(readUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(readUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(addRetailMktBond.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addRetailMktBond.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(addRetailMktBond.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getRetailMktBonds.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getRetailMktBonds.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bonds = action.payload
        state.error = null;
      })
      .addCase(getRetailMktBonds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readUserBonds.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bonds = action.payload
        state.error = null;
      })
      .addCase(getTokenListAndUpcomingPaymentsByIssuer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTokenListAndUpcomingPaymentsByIssuer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tokenList = action.payload.tokenList;
        state.upcomingPayment = action.payload.upcomingPayment;
      })
      .addCase(getTokenListAndUpcomingPaymentsByIssuer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default bondSlice.reducer;
