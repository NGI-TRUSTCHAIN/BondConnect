import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Bond } from "../Bond";
import { TransferInfo } from "../components/issuer/BlockchainTransfer";
import { UserData } from "../components/UserRegistration";
import { SaleReceipt } from "../components/TokenSale";
import { SettlementReceipt } from "../components/TokenSettlement";

interface BondState {
  bonds: Bond[] | null;
  users: UserData[];
  transferHistory: TransferInfo[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
}

const initialState: BondState = {
  bonds: null,
  users: [],
  transferHistory: null,
  status: "idle",
  error: undefined,
};

export const readBonds = createAsyncThunk("bond/readBonds", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/bonds", { method: "GET" });

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
    console.log("Fetched Bonds:", data); // Debugging step
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
    return data as UserData[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const registerUser = createAsyncThunk("bond/registerUser", async (userData: UserData, { rejectWithValue }) => {
  console.log("Before sending:", JSON.stringify(userData));
  try {
    const response = await fetch("/api/register-user", {
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
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
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
      });
  },
});

export default bondSlice.reducer;
