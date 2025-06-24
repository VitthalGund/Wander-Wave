import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  searchDestinationOrHotel,
  searchHotels,
  getHotelDetails,
  getHotelPrices,
  getHotelReviews,
  getSimilarHotels,
  getNearbyHotelsMap,
} from "../../services/skyScraperApi";
import type {
  Hotel,
  HotelSearchParams,
  HotelDetails,
  HotelReview,
  HotelPricing,
  Location,
} from "../../types/api";

interface HotelState {
  searchParams: HotelSearchParams;
  hotels: Hotel[];
  locations: Location[];
  hotelDetails: HotelDetails | null;
  hotelPrices: HotelPricing[];
  hotelReviews: HotelReview[];
  similarHotels: Hotel[];
  nearbyHotels: Hotel[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  sortBy: "price" | "rating" | "distance";
  showMap: boolean;
  filters: {
    minRating: number;
    maxPrice: number;
    amenities: string[];
    hotelType: string[];
  };
}

const initialState: HotelState = {
  searchParams: {
    location: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    rooms: 1,
    currency: "USD",
  },
  hotels: [],
  locations: [],
  hotelDetails: null,
  hotelPrices: [],
  hotelReviews: [],
  similarHotels: [],
  nearbyHotels: [],
  isLoading: false,
  isSearching: false,
  error: null,
  sortBy: "price",
  showMap: false,
  filters: {
    minRating: 0,
    maxPrice: 1000,
    amenities: [],
    hotelType: [],
  },
};

export const searchHotelLocations = createAsyncThunk(
  "hotels/searchLocations",
  async (query: string) => {
    return await searchDestinationOrHotel(query);
  }
);

export const searchHotelsAction = createAsyncThunk(
  "hotels/search",
  async (params: HotelSearchParams, { rejectWithValue }) => {
    try {
      return await searchHotels(params);
    } catch (error) {
      return rejectWithValue("Failed to search hotels");
    }
  }
);

export const fetchHotelDetails = createAsyncThunk(
  "hotels/fetchDetails",
  async (hotelId: string) => {
    return await getHotelDetails(hotelId);
  }
);

export const fetchHotelPrices = createAsyncThunk(
  "hotels/fetchPrices",
  async ({
    hotelId,
    checkInDate,
    checkOutDate,
    guests,
  }: {
    hotelId: string;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
  }) => {
    return await getHotelPrices(hotelId, checkInDate, checkOutDate, guests);
  }
);

export const fetchHotelReviews = createAsyncThunk(
  "hotels/fetchReviews",
  async ({ hotelId, limit = 10 }: { hotelId: string; limit?: number }) => {
    return await getHotelReviews(hotelId, limit);
  }
);

export const fetchSimilarHotels = createAsyncThunk(
  "hotels/fetchSimilar",
  async ({ hotelId, location }: { hotelId: string; location: string }) => {
    return await getSimilarHotels(hotelId, location);
  }
);

export const fetchNearbyHotels = createAsyncThunk(
  "hotels/fetchNearby",
  async ({
    lat,
    lng,
    radius = 10,
  }: {
    lat: number;
    lng: number;
    radius?: number;
  }) => {
    return await getNearbyHotelsMap(lat, lng, radius);
  }
);

const hotelSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    updateSearchParams: (
      state,
      action: PayloadAction<Partial<HotelSearchParams>>
    ) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setSortBy: (
      state,
      action: PayloadAction<"price" | "rating" | "distance">
    ) => {
      state.sortBy = action.payload;
    },
    updateFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.filters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleMapView: (state) => {
      state.showMap = !state.showMap;
    },
    clearHotels: (state) => {
      state.hotels = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearHotelDetails: (state) => {
      state.hotelDetails = null;
      state.hotelPrices = [];
      state.hotelReviews = [];
      state.similarHotels = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchHotelLocations.fulfilled, (state, action) => {
        state.locations = action.payload;
      })
      .addCase(searchHotelsAction.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchHotelsAction.fulfilled, (state, action) => {
        state.isSearching = false;
        state.hotels = action.payload.results;
      })
      .addCase(searchHotelsAction.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHotelDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHotelDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotelDetails = action.payload;
      })
      .addCase(fetchHotelDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHotelPrices.fulfilled, (state, action) => {
        state.hotelPrices = action.payload;
      })
      .addCase(fetchHotelReviews.fulfilled, (state, action) => {
        state.hotelReviews = action.payload;
      })
      .addCase(fetchSimilarHotels.fulfilled, (state, action) => {
        state.similarHotels = action.payload;
      })
      .addCase(fetchNearbyHotels.fulfilled, (state, action) => {
        state.nearbyHotels = action.payload;
      });
  },
});

export const {
  updateSearchParams,
  setSortBy,
  updateFilters,
  toggleMapView,
  clearHotels,
  clearError,
  clearHotelDetails,
} = hotelSlice.actions;

export default hotelSlice.reducer;
