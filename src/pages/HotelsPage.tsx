import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Hotel, MapPin, Star, Filter, Map, Navigation } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  searchHotelLocations,
  searchHotelsAction,
  fetchHotelDetails,
  fetchHotelPrices,
  fetchHotelReviews,
  fetchSimilarHotels,
  fetchNearbyHotels,
  updateSearchParams,
  setSortBy,
  updateFilters,
  toggleMapView,
} from "../store/slices/hotelSlice";
import Autocomplete from "../components/common/Autocomplete";
import LoadingSpinner from "../components/common/LoadingSpinner";

const HotelsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const {
    searchParams: hotelSearchParams,
    hotels,
    locations,
    hotelDetails,
    hotelPrices,
    hotelReviews,
    similarHotels,
    isSearching,
    sortBy,
    filters,
    showMap,
  } = useAppSelector((state) => state.hotels);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  // Local display value for autocomplete
  const [locationDisplayValue, setLocationDisplayValue] = useState("");

  // Geolocation states
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize search params from URL
  useEffect(() => {
    const location = searchParams.get("location") || "";
    const checkin = searchParams.get("checkin") || "";
    const checkout = searchParams.get("checkout") || "";
    const guests = parseInt(searchParams.get("guests") || "1");

    if (location || checkin || checkout) {
      dispatch(
        updateSearchParams({
          location,
          checkInDate: checkin,
          checkOutDate: checkout,
          guests,
        })
      );

      // Set display value from URL param
      setLocationDisplayValue(location);

      // Auto-search if we have minimum required params
      if (location && checkin && checkout) {
        dispatch(
          searchHotelsAction({
            location,
            checkInDate: checkin,
            checkOutDate: checkout,
            guests,
            rooms: 1,
            currency: "USD",
          })
        );
      }
    }
  }, [searchParams, dispatch]);

  // Initialize display value from Redux state
  useEffect(() => {
    if (hotelSearchParams.location && !locationDisplayValue) {
      setLocationDisplayValue(hotelSearchParams.location);
    }
  }, [hotelSearchParams.location, locationDisplayValue]);

  const handleSearch = () => {
    if (
      hotelSearchParams.location &&
      hotelSearchParams.checkInDate &&
      hotelSearchParams.checkOutDate
    ) {
      dispatch(searchHotelsAction(hotelSearchParams));
    }
  };

  const handleAutocompleteSearch = (query: string) => {
    if (query.length >= 2) {
      dispatch(searchHotelLocations(query));
    }
  };

  const handleLocationSelect = (option: any) => {
    setLocationDisplayValue(option.name);
    dispatch(updateSearchParams({ location: option.id }));
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
          fetchNearbyHotels({ lat: latitude, lng: longitude, radius: 10 })
        )
          .unwrap()
          .then((hotels) => {
            if (hotels && hotels.length > 0) {
              const nearestHotel = hotels[0];
              setLocationDisplayValue(nearestHotel.name);
              dispatch(updateSearchParams({ location: nearestHotel.id }));
              setLocationError(null);
            } else {
              setLocationError("No hotels found near your location");
            }
          })
          .catch(() => {
            setLocationError("Failed to find nearby hotels");
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
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleHotelSelect = (hotelId: string) => {
    setSelectedHotel(hotelId);
    dispatch(fetchHotelDetails(hotelId));
    dispatch(
      fetchHotelPrices({
        hotelId,
        checkInDate: hotelSearchParams.checkInDate,
        checkOutDate: hotelSearchParams.checkOutDate,
        guests: hotelSearchParams.guests,
      })
    );
    dispatch(fetchHotelReviews({ hotelId, limit: 5 }));
    dispatch(
      fetchSimilarHotels({ hotelId, location: hotelSearchParams.location })
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const sortedHotels = [...hotels].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "rating":
        return b.rating - a.rating;
      case "distance":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const filteredHotels = sortedHotels.filter((hotel) => {
    if (filters.minRating && hotel.rating < filters.minRating) return false;
    if (filters.maxPrice && hotel.price > filters.maxPrice) return false;
    if (
      filters.amenities.length > 0 &&
      !filters.amenities.some((amenity) => hotel.amenities.includes(amenity))
    )
      return false;
    return true;
  });

  const uniqueAmenities = [
    ...new Set(hotels.flatMap((hotel) => hotel.amenities)),
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 sticky top-20 z-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Autocomplete
                placeholder="Where are you going?"
                value={locationDisplayValue}
                onChange={(value) => {
                  setLocationDisplayValue(value);
                  handleAutocompleteSearch(value);
                }}
                onSelect={handleLocationSelect}
                options={locations.map((location) => ({
                  id: location.id,
                  name: location.name,
                  secondary: `${location.city}, ${location.country}`,
                  icon: <MapPin className="w-4 h-4" />,
                }))}
                icon={<Hotel className="w-5 h-5" />}
              />
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                title="Use current location"
              >
                {isLocating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
            </div>

            <input
              type="date"
              value={hotelSearchParams.checkInDate}
              onChange={(e) =>
                dispatch(updateSearchParams({ checkInDate: e.target.value }))
              }
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <input
              type="date"
              value={hotelSearchParams.checkOutDate}
              onChange={(e) =>
                dispatch(updateSearchParams({ checkOutDate: e.target.value }))
              }
              min={hotelSearchParams.checkInDate}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isSearching ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>Search</span>
                  <Hotel className="w-5 h-5" />
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
              onClick={() => dispatch(toggleMapView())}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-200 ${
                showMap
                  ? "text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
                  : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Map View</span>
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
                    max="1000"
                    step="25"
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
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={filters.minRating === rating}
                          onChange={(e) =>
                            dispatch(
                              updateFilters({
                                minRating: parseInt(e.target.value),
                              })
                            )
                          }
                          className="mr-2"
                        />
                        <div className="flex items-center space-x-1">
                          {renderStars(rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                            & up
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {uniqueAmenities.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amenities
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uniqueAmenities.slice(0, 10).map((amenity) => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity)}
                            onChange={(e) => {
                              const newAmenities = e.target.checked
                                ? [...filters.amenities, amenity]
                                : filters.amenities.filter(
                                    (a) => a !== amenity
                                  );
                              dispatch(
                                updateFilters({ amenities: newAmenities })
                              );
                            }}
                            className="mr-2"
                          />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {amenity}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() =>
                    dispatch(
                      updateFilters({
                        minRating: 0,
                        maxPrice: 1000,
                        amenities: [],
                        hotelType: [],
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
            {hotels.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredHotels.length} hotel
                  {filteredHotels.length !== 1 ? "s" : ""} found
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => dispatch(setSortBy(e.target.value as any))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="distance">Sort by Distance</option>
                </select>
              </div>
            )}

            <div className="space-y-6">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-4 text-gray-600 dark:text-gray-400">
                    Searching hotels...
                  </span>
                </div>
              ) : filteredHotels.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border hover:border-green-500 dark:hover:border-green-400"
                    onClick={() => handleHotelSelect(hotel.id)}
                  >
                    <div className="flex">
                      <div className="w-64 h-48 flex-shrink-0">
                        <img
                          src={
                            hotel.image ||
                            `https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`
                          }
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center space-x-1 mb-2">
                              {renderStars(hotel.rating)}
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                {hotel.rating} stars
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{hotel.address}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {hotel.amenities.slice(0, 4).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {hotel.amenities.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                  +{hotel.amenities.length - 4} more
                                </span>
                              )}
                            </div>
                            {hotel.reviewScore && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-green-600 dark:text-green-400 mr-1">
                                  {hotel.reviewScore}/10
                                </span>
                                <span>({hotel.reviewCount} reviews)</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                              ${hotel.price}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              per night
                            </div>
                            <button className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hotels found
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
      {selectedHotel && hotelDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hotelDetails.name}
                </h3>
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              {hotelDetails.images && hotelDetails.images.length > 0 && (
                <div className="mb-6">
                  <img
                    src={hotelDetails.images[0]}
                    alt={hotelDetails.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(hotelDetails.rating)}
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {hotelDetails.rating} stars
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{hotelDetails.address}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {hotelDetails.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Amenities
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {hotelDetails.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {hotelPrices.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Room Options
                      </h4>
                      <div className="space-y-3">
                        {hotelPrices.map((pricing, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {pricing.roomType}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {pricing.cancellationPolicy}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600 dark:text-green-400">
                                  ${pricing.price}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  per night
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hotelReviews.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Recent Reviews
                      </h4>
                      <div className="space-y-3">
                        {hotelReviews.map((review) => (
                          <div
                            key={review.id}
                            className="border-b border-gray-200 dark:border-gray-600 pb-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {review.comment}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              - {review.author}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {similarHotels.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Similar Hotels
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {similarHotels.slice(0, 3).map((hotel) => (
                      <div
                        key={hotel.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                      >
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                          {hotel.name}
                        </h5>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-1">
                            {renderStars(hotel.rating)}
                          </div>
                          <span className="font-bold text-green-600 dark:text-green-400 text-sm">
                            ${hotel.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsPage;
