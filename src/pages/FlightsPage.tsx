import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plane,
  Filter,
  Calendar,
  MapPin,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  searchFlights,
  searchAirports,
  fetchNearbyAirports,
  fetchPriceCalendar,
  fetchFlightDetails,
  updateSearchParams,
  setSortBy,
  updateFilters,
} from "../store/slices/flightSlice";
import Autocomplete from "../components/common/Autocomplete";
import LoadingSpinner from "../components/common/LoadingSpinner";

const FlightsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const {
    searchParams: flightSearchParams,
    flights,
    airports,
    priceCalendar,
    flightDetails,
    isSearching,
    sortBy,
    filters,
  } = useAppSelector((state) => state.flights);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);

  const [originDisplayValue, setOriginDisplayValue] = useState("");
  const [destinationDisplayValue, setDestinationDisplayValue] = useState("");

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const departure = searchParams.get("departure") || "";
    const returnDate = searchParams.get("return") || "";
    const passengers = parseInt(searchParams.get("passengers") || "1");

    if (origin || destination || departure) {
      dispatch(
        updateSearchParams({
          origin,
          destination,
          departureDate: departure,
          returnDate,
          adults: passengers,
        })
      );

      setOriginDisplayValue(origin);
      setDestinationDisplayValue(destination);

      if (origin && destination && departure) {
        dispatch(
          searchFlights({
            origin,
            destination,
            departureDate: departure,
            returnDate,
            adults: passengers,
            children: 0,
            infants: 0,
            cabinClass: "economy",
            currency: "USD",
          })
        );
      }
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (flightSearchParams.origin && !originDisplayValue) {
      setOriginDisplayValue(flightSearchParams.origin);
    }
    if (flightSearchParams.destination && !destinationDisplayValue) {
      setDestinationDisplayValue(flightSearchParams.destination);
    }
  }, [
    flightSearchParams.origin,
    flightSearchParams.destination,
    originDisplayValue,
    destinationDisplayValue,
  ]);

  const handleSearch = () => {
    if (
      flightSearchParams.origin &&
      flightSearchParams.destination &&
      flightSearchParams.departureDate
    ) {
      dispatch(searchFlights(flightSearchParams));
    }
  };

  const handleAutocompleteSearch = (query: string) => {
    if (query.length >= 2) {
      dispatch(searchAirports(query));
    }
  };

  const handleOriginSelect = (option: any) => {
    setOriginDisplayValue(option.name);
    dispatch(updateSearchParams({ origin: option.id }));
  };

  const handleDestinationSelect = (option: any) => {
    setDestinationDisplayValue(option.name);
    dispatch(updateSearchParams({ destination: option.id }));
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(
          fetchNearbyAirports({ lat: latitude, lng: longitude, radius: 50 })
        )
          .unwrap()
          .then((airports) => {
            if (airports && airports.length > 0) {
              const nearestAirport = airports[0];
              setOriginDisplayValue(
                `${nearestAirport.name} (${nearestAirport.iata})`
              );
              dispatch(updateSearchParams({ origin: nearestAirport.iata }));
              setLocationError(null);
            } else {
              setLocationError("No airports found near your location");
            }
          })
          .catch(() => {
            setLocationError("Failed to find nearby airports");
          })
          .finally(() => {
            setIsLocating(false);
          });
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable location permissions."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError(
              "An unknown error occurred while retrieving location."
            );
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleFlightSelect = (flightId: string) => {
    setSelectedFlight(flightId);
    dispatch(fetchFlightDetails(flightId));
  };

  const handleShowPriceCalendar = () => {
    if (flightSearchParams.origin && flightSearchParams.destination) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);

      dispatch(
        fetchPriceCalendar({
          origin: flightSearchParams.origin,
          destination: flightSearchParams.destination,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        })
      );
      setShowPriceCalendar(true);
    }
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "duration":
        return a.duration.localeCompare(b.duration);
      case "departure":
        return (
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime()
        );
      default:
        return 0;
    }
  });

  const filteredFlights = sortedFlights.filter((flight) => {
    if (filters.maxPrice && flight.price > filters.maxPrice) return false;
    if (filters.stops.length > 0 && !filters.stops.includes(flight.stops))
      return false;
    if (
      filters.airlines.length > 0 &&
      !filters.airlines.includes(flight.airline)
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 sticky top-20 z-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Autocomplete
                placeholder="From"
                value={originDisplayValue}
                onChange={(value) => {
                  setOriginDisplayValue(value);
                  handleAutocompleteSearch(value);
                }}
                onSelect={handleOriginSelect}
                options={airports.map((airport) => ({
                  id: airport.iata,
                  name: `${airport.name} (${airport.iata})`,
                  secondary: `${airport.city}, ${airport.country}`,
                  icon: <Plane className="w-4 h-4" />,
                }))}
                icon={<Plane className="w-5 h-5" />}
              />
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                title="Use current location"
              >
                {isLocating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
            </div>

            <Autocomplete
              placeholder="To"
              value={destinationDisplayValue}
              onChange={(value) => {
                setDestinationDisplayValue(value);
                handleAutocompleteSearch(value);
              }}
              onSelect={handleDestinationSelect}
              options={airports.map((airport) => ({
                id: airport.iata,
                name: `${airport.name} (${airport.iata})`,
                secondary: `${airport.city}, ${airport.country}`,
                icon: <MapPin className="w-4 h-4" />,
              }))}
              icon={<MapPin className="w-5 h-5" />}
            />

            <input
              type="date"
              value={flightSearchParams.departureDate}
              onChange={(e) =>
                dispatch(updateSearchParams({ departureDate: e.target.value }))
              }
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              type="date"
              value={flightSearchParams.returnDate}
              onChange={(e) =>
                dispatch(updateSearchParams({ returnDate: e.target.value }))
              }
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={flightSearchParams.adults}
              onChange={(e) =>
                dispatch(
                  updateSearchParams({ adults: parseInt(e.target.value) })
                )
              }
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num} Adult{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isSearching ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          {locationError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">
                {locationError}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={handleShowPriceCalendar}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
            >
              <Calendar className="w-4 h-4" />
              <span>Price Calendar</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-40">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Filters
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Price: ${filters.maxPrice}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      dispatch(
                        updateFilters({ maxPrice: parseInt(e.target.value) })
                      )
                    }
                    className="w-full"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stops
                  </label>
                  <div className="space-y-2">
                    {[0, 1, 2].map((stops) => (
                      <label key={stops} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.stops.includes(stops)}
                          onChange={(e) => {
                            const newStops = e.target.checked
                              ? [...filters.stops, stops]
                              : filters.stops.filter((s) => s !== stops);
                            dispatch(updateFilters({ stops: newStops }));
                          }}
                          className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {stops === 0
                            ? "Nonstop"
                            : `${stops} stop${stops > 1 ? "s" : ""}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() =>
                    dispatch(
                      updateFilters({
                        maxPrice: 10000,
                        stops: [],
                        airlines: [],
                        departureTime: [],
                      })
                    )
                  }
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {flights.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredFlights.length} flight
                  {filteredFlights.length !== 1 ? "s" : ""} found
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => dispatch(setSortBy(e.target.value as any))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="price">Sort by Price</option>
                  <option value="duration">Sort by Duration</option>
                  <option value="departure">Sort by Departure</option>
                </select>
              </div>
            )}

            <div className="space-y-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-4 text-gray-600 dark:text-gray-400">
                    Searching flights...
                  </span>
                </div>
              ) : filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer border hover:border-blue-500 dark:hover:border-blue-400"
                    onClick={() => handleFlightSelect(flight.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {flight.airline}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {flight.flightNumber}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatTime(flight.departureTime)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {flight.origin.iata}
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {formatDuration(flight.duration)}
                          </div>
                          <div className="w-24 h-px bg-gray-300 dark:bg-gray-600 relative">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {flight.stops === 0
                              ? "Nonstop"
                              : `${flight.stops} stop${
                                  flight.stops > 1 ? "s" : ""
                                }`}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatTime(flight.arrivalTime)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {flight.destination.iata}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${flight.price}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {flight.cabinClass}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No flights found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPriceCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Price Calendar
                </h3>
                <button
                  onClick={() => setShowPriceCalendar(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {priceCalendar.map((entry) => (
                  <div
                    key={entry.date}
                    className="p-3 text-center border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      ${entry.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFlight && flightDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Flight Details
                </h3>
                <button
                  onClick={() => setSelectedFlight(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {flightDetails.segments.map((segment, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-600 pb-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {segment.airline} {segment.flightNumber}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {segment.aircraft}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(segment.departureTime)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {segment.origin.name}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(segment.arrivalTime)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {segment.destination.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {flightDetails.layovers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Layovers
                    </h4>
                    {flightDetails.layovers.map((layover, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {layover.airport.name}: {layover.duration}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Baggage
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flightDetails.baggage}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedFlight(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <a
                    href={flightDetails.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors duration-200"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightsPage;
