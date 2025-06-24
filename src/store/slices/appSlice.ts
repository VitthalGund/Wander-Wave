import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getLocale,
  checkServer,
  getConfig,
} from "../../services/skyScraperApi";
import type { LocaleData, ServerStatus, ConfigData } from "../../types/api";

interface AppState {
  theme: "light" | "dark";
  locale: LocaleData | null;
  serverStatus: ServerStatus | null;
  config: ConfigData | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AppState = {
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  locale: null,
  serverStatus: null,
  config: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const initializeApp = createAsyncThunk(
  "app/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const [locale, serverStatus, config] = await Promise.all([
        getLocale(),
        checkServer(),
        getConfig(),
      ]);

      return { locale, serverStatus, config };
    } catch (error) {
      return rejectWithValue("Failed to initialize application");
    }
  }
);

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
      if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", state.theme);

      if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locale = action.payload.locale;
        state.serverStatus = action.payload.serverStatus;
        state.config = action.payload.config;
        state.isInitialized = true;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleTheme, setTheme, clearError } = appSlice.actions;
export default appSlice.reducer;
