import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Car, MapPin, Filter, Users, Fuel, Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  searchCarLocations,
  searchCarsAction,
  updateSearchParams,
  setSortBy,
  updateFilters,
} from "../store/slices/carSlice";
import Autocomplete from "../components/common/Autocomplete";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CarsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const {
    searchParams: carSearchParams,
    cars,
    locations,
    isSearching,
    sortBy,
    filters,
  } = useAppSelector((state) => state.cars);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  const [pickupDisplayValue, setPickupDisplayValue] = useState("");
  const [dropoffDisplayValue, setDropoffDisplayValue] = useState("");

  useEffect(() => {
    const pickup = searchParams.get("pickup") || "";
    const dropoff = searchParams.get("dropoff") || "";
    const pickupDate = searchParams.get("pickupDate") || "";
    const dropoffDate = searchParams.get("dropoffDate") || "";
    const age = parseInt(searchParams.get("age") || "25");

    if (pickup || dropoff || pickupDate) {
      dispatch(
        updateSearchParams({
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          pickupDate,
          dropoffDate,
          driverAge: age,
        })
      );

      setPickupDisplayValue(pickup);
      setDropoffDisplayValue(dropoff);

      if (pickup && pickupDate && dropoffDate) {
        dispatch(
          searchCarsAction({
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            pickupDate,
            dropoffDate,
            driverAge: age,
            currency: "USD",
          })
        );
      }
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (carSearchParams.pickupLocation && !pickupDisplayValue) {
      setPickupDisplayValue(carSearchParams.pickupLocation);
    }
    if (carSearchParams.dropoffLocation && !dropoffDisplayValue) {
      setDropoffDisplayValue(carSearchParams.dropoffLocation || "");
    }
  }, [
    carSearchParams.pickupLocation,
    carSearchParams.dropoffLocation,
    pickupDisplayValue,
    dropoffDisplayValue,
  ]);

  const handleSearch = () => {
    if (
      carSearchParams.pickupLocation &&
      carSearchParams.pickupDate &&
      carSearchParams.dropoffDate
    ) {
      dispatch(searchCarsAction(carSearchParams));
    }
  };

  const handleAutocompleteSearch = (query: string) => {
    if (query.length >= 2) {
      dispatch(searchCarLocations(query));
    }
  };

  const handlePickupSelect = (option: any) => {
    setPickupDisplayValue(option.name);
    dispatch(updateSearchParams({ pickupLocation: option.id }));
  };

  const handleDropoffSelect = (option: any) => {
    setDropoffDisplayValue(option.name);
    dispatch(updateSearchParams({ dropoffLocation: option.id }));
  };

  const getCarTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "suv":
        return "🚙";
      case "sedan":
        return "🚗";
      case "hatchback":
        return "🚗";
      case "convertible":
        return "🏎️";
      case "truck":
        return "🚚";
      case "van":
        return "🚐";
      default:
        return "🚗";
    }
  };

  const sortedCars = [...cars].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "type":
        return a.type.localeCompare(b.type);
      case "rating":
        return a.brand.localeCompare(b.brand);
      default:
        return 0;
    }
  });

  const filteredCars = sortedCars.filter((car) => {
    if (filters.maxPrice && car.price > filters.maxPrice) return false;
    if (filters.carTypes.length > 0 && !filters.carTypes.includes(car.type))
      return false;
    if (
      filters.providers.length > 0 &&
      !filters.providers.includes(car.provider)
    )
      return false;
    return true;
  });

  const uniqueCarTypes = [...new Set(cars.map((car) => car.type))];
  const uniqueProviders = [...new Set(cars.map((car) => car.provider))];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 sticky top-20 z-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Autocomplete
              placeholder="Pickup location"
              value={pickupDisplayValue}
              onChange={(value) => {
                setPickupDisplayValue(value);
                handleAutocompleteSearch(value);
              }}
              onSelect={handlePickupSelect}
              options={locations.map((location) => ({
                id: location.id,
                name: location.name,
                secondary: `${location.city}, ${location.country}`,
                icon: <MapPin className="w-4 h-4" />,
              }))}
              icon={<Car className="w-5 h-5" />}
            />

            <Autocomplete
              placeholder="Drop-off location"
              value={dropoffDisplayValue}
              onChange={(value) => {
                setDropoffDisplayValue(value);
                handleAutocompleteSearch(value);
              }}
              onSelect={handleDropoffSelect}
              options={locations.map((location) => ({
                id: location.id,
                name: location.name,
                secondary: `${location.city}, ${location.country}`,
                icon: <MapPin className="w-4 h-4" />,
              }))}
              icon={<MapPin className="w-5 h-5" />}
            />

            <input
              type="date"
              value={carSearchParams.pickupDate}
              onChange={(e) =>
                dispatch(updateSearchParams({ pickupDate: e.target.value }))
              }
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <input
              type="date"
              value={carSearchParams.dropoffDate}
              onChange={(e) =>
                dispatch(updateSearchParams({ dropoffDate: e.target.value }))
              }
              min={carSearchParams.pickupDate}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <select
              value={carSearchParams.driverAge}
              onChange={(e) =>
                dispatch(
                  updateSearchParams({ driverAge: parseInt(e.target.value) })
                )
              }
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {Array.from({ length: 56 }, (_, i) => i + 18).map((age) => (
                <option key={age} value={age}>
                  {age} years old
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isSearching ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>Search</span>
                  <Car className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Additional Options */}
          <div className="flex flex-wrap gap-4 mt-4">
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
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-40">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Filters
                </h3>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Price: ${filters.maxPrice}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
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

                {/* Car Types */}
                {uniqueCarTypes.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Car Type
                    </label>
                    <div className="space-y-2">
                      {uniqueCarTypes.map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.carTypes.includes(type)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...filters.carTypes, type]
                                : filters.carTypes.filter((t) => t !== type);
                              dispatch(updateFilters({ carTypes: newTypes }));
                            }}
                            className="mr-2"
                          />
                          <span className="text-gray-700 dark:text-gray-300 flex items-center">
                            <span className="mr-2">{getCarTypeIcon(type)}</span>
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Providers */}
                {uniqueProviders.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Provider
                    </label>
                    <div className="space-y-2">
                      {uniqueProviders.map((provider) => (
                        <label key={provider} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.providers.includes(provider)}
                            onChange={(e) => {
                              const newProviders = e.target.checked
                                ? [...filters.providers, provider]
                                : filters.providers.filter(
                                    (p) => p !== provider
                                  );
                              dispatch(
                                updateFilters({ providers: newProviders })
                              );
                            }}
                            className="mr-2"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {provider}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reset Filters */}
                <button
                  onClick={() =>
                    dispatch(
                      updateFilters({
                        maxPrice: 500,
                        carTypes: [],
                        providers: [],
                        features: [],
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

          {/* Results */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Sort Options */}
            {cars.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredCars.length} car
                  {filteredCars.length !== 1 ? "s" : ""} found
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => dispatch(setSortBy(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="price">Sort by Price</option>
                  <option value="type">Sort by Type</option>
                  <option value="rating">Sort by Rating</option>
                </select>
              </div>
            )}

            {/* Car Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isSearching ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-4 text-gray-600 dark:text-gray-400">
                    Searching cars...
                  </span>
                </div>
              ) : filteredCars.length > 0 ? (
                filteredCars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border hover:border-orange-500 dark:hover:border-orange-400"
                    onClick={() => setSelectedCar(car.id)}
                  >
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={
                          car.image ||
                          `https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop`
                        }
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {car.brand} {car.model}
                        </h3>
                        <span className="text-2xl">
                          {getCarTypeIcon(car.type)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {car.type} • {car.provider}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {car.seats}
                        </div>
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-1" />
                          {car.transmission}
                        </div>
                        <div className="flex items-center">
                          <Fuel className="w-4 h-4 mr-1" />
                          {car.fuelType}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {car.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {car.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{car.features.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ${car.price}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            per day
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200">
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No cars found
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

      {/* Car Details Modal */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Car Rental Details
                </h3>
                <button
                  onClick={() => setSelectedCar(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>

              {(() => {
                const car = cars.find((c) => c.id === selectedCar);
                if (!car) return null;

                return (
                  <div className="space-y-6">
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {car.brand} {car.model}
                      </h4>
                      <div className="text-gray-600 dark:text-gray-400 mb-4">
                        {car.type} • {car.provider}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Users className="w-5 h-5 mr-2" />
                          <span>{car.seats} seats</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Settings className="w-5 h-5 mr-2" />
                          <span>{car.transmission}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Fuel className="w-5 h-5 mr-2" />
                          <span>{car.fuelType}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          Features
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {car.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Total Price
                          </span>
                          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            $
                            {car.price *
                              Math.max(
                                1,
                                Math.ceil(
                                  (new Date(
                                    carSearchParams.dropoffDate
                                  ).getTime() -
                                    new Date(
                                      carSearchParams.pickupDate
                                    ).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${car.price} per day
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setSelectedCar(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Close
                      </button>
                      <button className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200">
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarsPage;
