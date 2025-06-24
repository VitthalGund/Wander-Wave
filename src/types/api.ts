export interface LocaleData {
  currency: string;
  language: string;
  country: string;
}

export interface ServerStatus {
  status: string;
  timestamp?: string;
}

export interface ConfigData {
  cabinClasses: string[];
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  currencies: string[];
  languages: string[];
}

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  bookingUrl?: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  currency: string;
}

export interface MultiStopLeg {
  origin: string;
  destination: string;
  date: string;
}

export interface PriceCalendarEntry {
  date: string;
  price: number;
}

export interface FlightDetails {
  itineraryId: string;
  segments: FlightSegment[];
  layovers: Layover[];
  baggage: string;
  amenities: string[];
  bookingUrl: string;
}

export interface FlightSegment {
  airline: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  aircraft: string;
}

export interface Layover {
  airport: Airport;
  duration: string;
}

export interface DestinationSuggestion {
  iata: string;
  city: string;
  country: string;
  price: number;
  image?: string;
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  price: number;
  currency: string;
  image: string;
  address: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  reviewScore?: number;
  reviewCount?: number;
}

export interface HotelSearchParams {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  currency: string;
}

export interface HotelDetails {
  id: string;
  name: string;
  rating: number;
  address: string;
  description: string;
  amenities: string[];
  images: string[];
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
}

export interface HotelReview {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  helpful?: number;
}

export interface HotelPricing {
  roomType: string;
  price: number;
  currency: string;
  cancellationPolicy: string;
  breakfast?: boolean;
}

export interface Car {
  id: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  currency: string;
  image: string;
  seats: number;
  transmission: string;
  fuelType: string;
  provider: string;
  features: string[];
}

export interface CarSearchParams {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  dropoffDate: string;
  driverAge: number;
  currency: string;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page?: number;
  hasMore?: boolean;
  sessionId?: string;
}
