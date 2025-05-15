import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Investor } from "../components/Authentication/InvestorRegistration";
import { Issuer } from "../components/Authentication/IssuerRegistration";

interface BondState {
  userLoged: Investor | Issuer | null;
  investors: (Investor | Issuer)[];
  issuers: Issuer[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
}

const initialState: BondState = {
  userLoged: null,
  investors: [],
  issuers: [],
  status: "idle",
  error: undefined,
};

export const registerInvestor = createAsyncThunk(
  "user/registerInvestor",
  async (dataI: { investor: Investor | Issuer; particular: boolean }, { rejectWithValue }) => {
    console.log("Before sending:", JSON.stringify(dataI.investor));
    try {
      const response = await fetch("/api/register-investor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataI),
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

export const readInvestors = createAsyncThunk("user/readInvestors", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/investors", { method: "GET" });

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
    return data as (Investor | Issuer)[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const registerIssuer = createAsyncThunk("user/registerIssuer", async (issuer: Issuer, { rejectWithValue }) => {
  console.log("Before sending:", JSON.stringify(issuer));
  try {
    const response = await fetch("/api/register-issuer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issuer),
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

export const readIssuers = createAsyncThunk("user/readIssuers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/issuers", { method: "GET" });

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
    return data as Issuer[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const login = createAsyncThunk(
  "user/login",
  async (log: { profile: string; email: string; password: string }, { rejectWithValue }) => {
    console.log("Before sending:", JSON.stringify(log));
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(log),
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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerInvestor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerInvestor.fulfilled, (state, action) => {
        state.error = null;
        state.userLoged = action.payload;
        state.status = "succeeded";
      })
      .addCase(registerInvestor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(registerIssuer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerIssuer.fulfilled, (state, action) => {
        state.error = null;
        state.userLoged = action.payload;
        state.status = "succeeded";
      })
      .addCase(registerIssuer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readInvestors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readInvestors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.investors = action.payload;
      })
      .addCase(readInvestors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readIssuers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readIssuers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.issuers = action.payload;
      })
      .addCase(readIssuers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userLoged = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
