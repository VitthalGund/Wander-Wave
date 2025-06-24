import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { searchCarLocation, searchCars } from "../../services/skyScraperApi";
import type { Car, CarSearchParams, Location } from "../../types/api";

interface CarState {
  searchParams: CarSearchParams;
  cars: Car[];
  locations: Location[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  sortBy: "price" | "type" | "rating";
  filters: {
    maxPrice: number;
    carTypes: string[];
    providers: string[];
    features: string[];
  };
}

const initialState: CarState = {
  searchParams: {
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    dropoffDate: "",
    driverAge: 25,
    currency: "USD",
  },
  cars: [],
  locations: [],
  isLoading: false,
  isSearching: false,
  error: null,
  sortBy: "price",
  filters: {
    maxPrice: 500,
    carTypes: [],
    providers: [],
    features: [],
  },
};
export const searchCarLocations = createAsyncThunk(
  "cars/searchLocations",
  async (query: string) => {
    return await searchCarLocation(query);
  }
);

export const searchCarsAction = createAsyncThunk(
  "cars/search",
  async (params: CarSearchParams, { rejectWithValue }) => {
    try {
      return await searchCars(params);
    } catch (error) {
      return rejectWithValue("Failed to search cars");
    }
  }
);

const carSlice = createSlice({
  name: "cars",
  initialState,
  reducers: {
    updateSearchParams: (
      state,
      action: PayloadAction<Partial<CarSearchParams>>
    ) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setSortBy: (state, action: PayloadAction<"price" | "type" | "rating">) => {
      state.sortBy = action.payload;
    },
    updateFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.filters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCars: (state) => {
      state.cars = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchCarLocations.fulfilled, (state, action) => {
        state.locations = action.payload;
      })
      .addCase(searchCarsAction.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchCarsAction.fulfilled, (state, action) => {
        state.isSearching = false;
        state.cars = action.payload.results;
      })
      .addCase(searchCarsAction.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateSearchParams,
  setSortBy,
  updateFilters,
  clearCars,
  clearError,
} = carSlice.actions;

export default carSlice.reducer;
