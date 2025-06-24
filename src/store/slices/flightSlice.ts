import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  searchFlightsV2,
  searchFlightsV1,
  searchAirport,
  getNearByAirports,
  getPriceCalendar,
  getFlightDetails,
  searchFlightEverywhere,
  searchFlightsMultiStops,
} from "../../services/skyScraperApi";
import type {
  Flight,
  Airport,
  FlightSearchParams,
  PriceCalendarEntry,
  FlightDetails,
  DestinationSuggestion,
  MultiStopLeg,
  SearchResponse,
} from "../../types/api";

interface FlightState {
  searchParams: FlightSearchParams;
  flights: Flight[];
  airports: Airport[];
  nearbyAirports: Airport[];
  priceCalendar: PriceCalendarEntry[];
  flightDetails: FlightDetails | null;
  destinations: DestinationSuggestion[];
  multiStopFlights: Flight[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  sortBy: "price" | "duration" | "departure";
  filters: {
    maxPrice: number;
    stops: number[];
    airlines: string[];
    departureTime: string[];
  };
}

const initialState: FlightState = {
  searchParams: {
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "economy",
    currency: "USD",
  },
  flights: [],
  airports: [],
  nearbyAirports: [],
  priceCalendar: [],
  flightDetails: null,
  destinations: [],
  multiStopFlights: [],
  isLoading: false,
  isSearching: false,
  error: null,
  sortBy: "price",
  filters: {
    maxPrice: 10000,
    stops: [],
    airlines: [],
    departureTime: [],
  },
};
export const searchFlights = createAsyncThunk(
  "flights/search",
  async (params: FlightSearchParams, { rejectWithValue }) => {
    try {
      try {
        const response = await searchFlightsV2(params);
        return response;
      } catch (error) {
        console.warn("V2 search failed, trying V1");
        const response = await searchFlightsV1(params);
        return response;
      }
    } catch (error) {
      return rejectWithValue("Failed to search flights");
    }
  }
);

export const searchAirports = createAsyncThunk(
  "flights/searchAirports",
  async (query: string) => {
    return await searchAirport(query);
  }
);

export const fetchNearbyAirports = createAsyncThunk(
  "flights/fetchNearbyAirports",
  async ({
    lat,
    lng,
    radius = 50,
  }: {
    lat: number;
    lng: number;
    radius?: number;
  }) => {
    return await getNearByAirports(lat, lng, radius);
  }
);

export const fetchPriceCalendar = createAsyncThunk(
  "flights/fetchPriceCalendar",
  async ({
    origin,
    destination,
    startDate,
    endDate,
  }: {
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
  }) => {
    return await getPriceCalendar(origin, destination, startDate, endDate);
  }
);

export const fetchFlightDetails = createAsyncThunk(
  "flights/fetchFlightDetails",
  async (itineraryId: string) => {
    return await getFlightDetails(itineraryId);
  }
);

export const fetchDestinations = createAsyncThunk(
  "flights/fetchDestinations",
  async ({
    origin,
    departureDate,
    maxPrice,
  }: {
    origin: string;
    departureDate: string;
    maxPrice?: number;
  }) => {
    return await searchFlightEverywhere(origin, departureDate, maxPrice);
  }
);

export const searchMultiStopFlights = createAsyncThunk(
  "flights/searchMultiStop",
  async ({ legs, adults }: { legs: MultiStopLeg[]; adults: number }) => {
    return await searchFlightsMultiStops(legs, adults);
  }
);

const flightSlice = createSlice({
  name: "flights",
  initialState,
  reducers: {
    updateSearchParams: (
      state,
      action: PayloadAction<Partial<FlightSearchParams>>
    ) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setSortBy: (
      state,
      action: PayloadAction<"price" | "duration" | "departure">
    ) => {
      state.sortBy = action.payload;
    },
    updateFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.filters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFlights: (state) => {
      state.flights = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFlightDetails: (state) => {
      state.flightDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.isSearching = false;
        state.flights = action.payload.results;
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      })
      .addCase(searchAirports.fulfilled, (state, action) => {
        state.airports = action.payload;
      })
      .addCase(fetchNearbyAirports.fulfilled, (state, action) => {
        state.nearbyAirports = action.payload;
      })
      .addCase(fetchPriceCalendar.fulfilled, (state, action) => {
        state.priceCalendar = action.payload;
      })
      .addCase(fetchFlightDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFlightDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flightDetails = action.payload;
      })
      .addCase(fetchFlightDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.destinations = action.payload;
      })
      .addCase(searchMultiStopFlights.fulfilled, (state, action) => {
        state.multiStopFlights = action.payload.results;
      });
  },
});

export const {
  updateSearchParams,
  setSortBy,
  updateFilters,
  clearFlights,
  clearError,
  clearFlightDetails,
} = flightSlice.actions;

export default flightSlice.reducer;
