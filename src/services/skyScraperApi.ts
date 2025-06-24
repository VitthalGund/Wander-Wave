import apiClient from "./api";
import type {
  LocaleData,
  ServerStatus,
  ConfigData,
  Airport,
  Flight,
  FlightSearchParams,
  MultiStopLeg,
  PriceCalendarEntry,
  FlightDetails,
  DestinationSuggestion,
  Hotel,
  HotelSearchParams,
  HotelDetails,
  HotelReview,
  HotelPricing,
  Car,
  CarSearchParams,
  Location,
  SearchResponse,
} from "../types/api";

// General Endpoints
export const getLocale = async (
  market = "US",
  language = "en-US"
): Promise<LocaleData> => {
  const response = await apiClient.get("/api/v1/getLocale", {
    params: { market, language },
  });
  return response.data;
};

export const checkServer = async (): Promise<ServerStatus> => {
  const response = await apiClient.get("/api/v1/checkServer");
  return response.data;
};

export const getConfig = async (): Promise<ConfigData> => {
  const response = await apiClient.get("/api/v1/getConfig");
  return response.data;
};

// Flight Endpoints
export const getNearByAirports = async (
  latitude: number,
  longitude: number,
  radius = 50
): Promise<Airport[]> => {
  const response = await apiClient.get("/api/v1/flights/getNearByAirports", {
    params: { latitude, longitude, radius },
  });
  return response.data.data || response.data.airports || [];
};

export const searchAirport = async (query: string): Promise<Airport[]> => {
  if (!query.trim()) return [];

  try {
    const response = await apiClient.get("/api/v1/flights/searchAirport", {
      params: { query },
    });
    return response.data.data || response.data.results || [];
  } catch (error) {
    console.error("Airport search failed:", error);
    return [];
  }
};

export const searchFlightsV2 = async (
  params: FlightSearchParams
): Promise<SearchResponse<Flight>> => {
  const response = await apiClient.get("/api/v1/flights/searchFlights", {
    params: {
      originSkyId: params.origin,
      destinationSkyId: params.destination,
      originEntityId: params.origin,
      destinationEntityId: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      cabinClass: params.cabinClass,
      currency: params.currency,
      market: "US",
      locale: "en-US",
    },
  });

  return {
    results: response.data.data?.itineraries || response.data.results || [],
    total: response.data.data?.count || response.data.total || 0,
    sessionId: response.data.sessionId,
  };
};

export const searchFlightsV1 = async (
  params: FlightSearchParams
): Promise<SearchResponse<Flight>> => {
  const response = await apiClient.get("/api/v1/flights/searchFlights", {
    params: {
      ...params,
      market: "US",
      locale: "en-US",
    },
  });

  return {
    results: response.data.data?.itineraries || response.data.results || [],
    total: response.data.data?.count || response.data.total || 0,
  };
};

export const searchFlightsComplete = async (
  sessionId: string
): Promise<SearchResponse<Flight>> => {
  const response = await apiClient.get(
    "/api/v1/flights/searchFlightsComplete",
    {
      params: { sessionId },
    }
  );

  return {
    results: response.data.data?.itineraries || response.data.results || [],
    total: response.data.data?.count || response.data.total || 0,
  };
};

export const searchIncomplete = async (
  params: FlightSearchParams
): Promise<{ sessionId: string }> => {
  const response = await apiClient.get("/api/v1/flights/searchIncomplete", {
    params: {
      originSkyId: params.origin,
      destinationSkyId: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      cabinClass: params.cabinClass,
      currency: params.currency,
    },
  });
  return { sessionId: response.data.sessionId };
};

export const getFlightDetails = async (
  itineraryId: string
): Promise<FlightDetails> => {
  const response = await apiClient.get("/api/v1/flights/getFlightDetails", {
    params: { itineraryId },
  });
  return response.data.data || response.data;
};

export const getPriceCalendar = async (
  origin: string,
  destination: string,
  startDate: string,
  endDate: string
): Promise<PriceCalendarEntry[]> => {
  const response = await apiClient.get("/api/v1/flights/getPriceCalendar", {
    params: {
      originSkyId: origin,
      destinationSkyId: destination,
      startDate,
      endDate,
    },
  });
  return response.data.data?.prices || response.data.prices || [];
};

export const searchFlightsMultiStops = async (
  legs: MultiStopLeg[],
  adults: number,
  currency = "USD"
): Promise<SearchResponse<Flight>> => {
  const response = await apiClient.get(
    "/api/v1/flights/searchFlightsMultiStops",
    {
      params: {
        legs: JSON.stringify(legs),
        adults,
        currency,
        market: "US",
        locale: "en-US",
      },
    }
  );

  return {
    results: response.data.data?.itineraries || response.data.results || [],
    total: response.data.data?.count || response.data.total || 0,
  };
};

export const searchFlightEverywhere = async (
  origin: string,
  departureDate: string,
  maxPrice?: number,
  currency = "USD"
): Promise<DestinationSuggestion[]> => {
  const response = await apiClient.get(
    "/api/v1/flights/searchFlightEverywhere",
    {
      params: {
        originSkyId: origin,
        departureDate,
        maxPrice,
        currency,
        market: "US",
        locale: "en-US",
      },
    }
  );
  return response.data.data?.destinations || response.data.destinations || [];
};

export const searchFlightEverywhereDeprecated = async (
  origin: string,
  departureDate: string,
  maxPrice?: number,
  currency = "USD"
): Promise<DestinationSuggestion[]> => {
  try {
    const response = await apiClient.get(
      "/api/v1/flights/searchFlightEverywhere-deprecated",
      {
        params: {
          originSkyId: origin,
          departureDate,
          maxPrice,
          currency,
        },
      }
    );
    return response.data.data?.destinations || response.data.destinations || [];
  } catch (error) {
    console.warn("Deprecated endpoint failed, using fallback");
    return [];
  }
};

export const searchFlightsWebComplete = async (
  params: FlightSearchParams
): Promise<SearchResponse<Flight>> => {
  const response = await apiClient.get(
    "/api/v1/flights/searchFlightsWebComplete",
    {
      params: {
        originSkyId: params.origin,
        destinationSkyId: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children,
        infants: params.infants,
        cabinClass: params.cabinClass,
        currency: params.currency,
        market: "US",
        locale: "en-US",
      },
    }
  );

  return {
    results: response.data.data?.itineraries || response.data.results || [],
    total: response.data.data?.count || response.data.total || 0,
  };
};

// Hotel Endpoints
export const searchDestinationOrHotel = async (
  query: string
): Promise<Location[]> => {
  if (!query.trim()) return [];

  try {
    const response = await apiClient.get(
      "/api/v1/hotels/searchDestinationOrHotel",
      {
        params: { query },
      }
    );
    return response.data.data || response.data.results || [];
  } catch (error) {
    console.error("Hotel destination search failed:", error);
    return [];
  }
};

export const searchHotels = async (
  params: HotelSearchParams
): Promise<SearchResponse<Hotel>> => {
  const response = await apiClient.get("/api/v1/hotels/searchHotels", {
    params: {
      entityId: params.location,
      checkin: params.checkInDate,
      checkout: params.checkOutDate,
      adults: params.guests,
      rooms: params.rooms,
      currency: params.currency,
      market: "US",
      locale: "en-US",
    },
  });

  return {
    results: response.data.data?.hotels || response.data.results || [],
    total: response.data.data?.count || response.data.total || 0,
  };
};

export const getHotelDetails = async (
  hotelId: string
): Promise<HotelDetails> => {
  const response = await apiClient.get("/api/v1/hotels/getHotelDetails", {
    params: { hotelId },
  });
  return response.data.data || response.data;
};

export const getHotelPrices = async (
  hotelId: string,
  checkInDate: string,
  checkOutDate: string,
  guests: number
): Promise<HotelPricing[]> => {
  const response = await apiClient.get("/api/v1/hotels/getHotelPrices", {
    params: {
      hotelId,
      checkin: checkInDate,
      checkout: checkOutDate,
      adults: guests,
    },
  });
  return response.data.data?.prices || response.data.prices || [];
};

export const getHotelReviews = async (
  hotelId: string,
  limit = 10
): Promise<HotelReview[]> => {
  const response = await apiClient.get("/api/v1/hotels/getHotelReviews", {
    params: { hotelId, limit },
  });
  return response.data.data?.reviews || response.data.reviews || [];
};

export const getSimilarHotels = async (
  hotelId: string,
  location: string
): Promise<Hotel[]> => {
  const response = await apiClient.get("/api/v1/hotels/similarHotels", {
    params: { hotelId, entityId: location },
  });
  return response.data.data?.hotels || response.data.hotels || [];
};

export const getNearbyHotelsMap = async (
  latitude: number,
  longitude: number,
  radius = 10
): Promise<Hotel[]> => {
  const response = await apiClient.get("/api/v1/hotels/nearbyMap", {
    params: { latitude, longitude, radius },
  });
  return response.data.data?.hotels || response.data.hotels || [];
};

// Car Hire Endpoints
export const searchCarLocation = async (query: string): Promise<Location[]> => {
  if (!query.trim()) return [];

  try {
    const response = await apiClient.get("/api/v1/cars/searchLocation", {
      params: { query },
    });
    return response.data.data || response.data.results || [];
  } catch (error) {
    console.error("Car location search failed:", error);
    return [];
  }
};

export const searchCars = async (
  params: CarSearchParams
): Promise<SearchResponse<Car>> => {
  const response = await apiClient.get("/api/v1/cars/searchCars", {
    params: {
      pickupEntityId: params.pickupLocation,
      dropoffEntityId: params.dropoffLocation || params.pickupLocation,
      pickupDate: params.pickupDate,
      dropoffDate: params.dropoffDate,
      driverAge: params.driverAge,
      currency: params.currency,
      market: "US",
      locale: "en-US",
    },
  });

  return {
    results: response.data.data?.cars || response.data.results || [],
    total: response.data.data?.count || response.data.total || 0,
  };
};

// Error handling wrapper for all API calls
export const withErrorHandling = <T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  fallbackValue: R
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await apiFunction(...args);
    } catch (error) {
      console.error("API call failed:", error);
      return fallbackValue;
    }
  };
};
