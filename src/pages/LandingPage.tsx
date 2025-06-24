import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Calendar,
  ArrowRight,
  Globe,
  Shield,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { initializeApp } from "../store/slices/appSlice";
import { fetchDestinations, searchAirports } from "../store/slices/flightSlice";
import { searchHotelLocations } from "../store/slices/hotelSlice";
import { searchCarLocations } from "../store/slices/carSlice";
import Autocomplete from "../components/common/Autocomplete";

const LandingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.app);
  const { destinations } = useAppSelector((state) => state.flights);
  const { airports } = useAppSelector((state) => state.flights);
  const { locations: hotelLocations } = useAppSelector((state) => state.hotels);
  const { locations: carLocations } = useAppSelector((state) => state.cars);

  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "cars">(
    "flights"
  );

  const [searchValues, setSearchValues] = useState({
    flights: {
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: "",
      passengers: 1,
    },
    hotels: { location: "", checkin: "", checkout: "", guests: 1 },
    cars: { pickup: "", dropoff: "", pickupDate: "", dropoffDate: "", age: 25 },
  });

  const [displayValues, setDisplayValues] = useState({
    flights: { originDisplay: "", destinationDisplay: "" },
    hotels: { locationDisplay: "" },
    cars: { pickupDisplay: "", dropoffDisplay: "" },
  });

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeApp());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );

    dispatch(
      fetchDestinations({
        origin: "JFK",
        departureDate: nextMonth.toISOString().split("T")[0],
        maxPrice: 1000,
      })
    );
  }, [dispatch]);

  const handleSearch = () => {
    switch (activeTab) {
      case "flights":
        window.location.href = `/flights?origin=${searchValues.flights.origin}&destination=${searchValues.flights.destination}&departure=${searchValues.flights.departureDate}&return=${searchValues.flights.returnDate}&passengers=${searchValues.flights.passengers}`;
        break;
      case "hotels":
        window.location.href = `/hotels?location=${searchValues.hotels.location}&checkin=${searchValues.hotels.checkin}&checkout=${searchValues.hotels.checkout}&guests=${searchValues.hotels.guests}`;
        break;
      case "cars":
        window.location.href = `/cars?pickup=${searchValues.cars.pickup}&dropoff=${searchValues.cars.dropoff}&pickupDate=${searchValues.cars.pickupDate}&dropoffDate=${searchValues.cars.dropoffDate}&age=${searchValues.cars.age}`;
        break;
    }
  };

  const handleAutocompleteSearch = (type: string, query: string) => {
    if (query.length >= 2) {
      switch (type) {
        case "airport":
          dispatch(searchAirports(query));
          break;
        case "hotel":
          dispatch(searchHotelLocations(query));
          break;
        case "car":
          dispatch(searchCarLocations(query));
          break;
      }
    }
  };

  const handleFlightOriginSelect = (option: any) => {
    setDisplayValues((prev) => ({
      ...prev,
      flights: { ...prev.flights, originDisplay: option.name },
    }));
    setSearchValues((prev) => ({
      ...prev,
      flights: { ...prev.flights, origin: option.id },
    }));
  };

  const handleFlightDestinationSelect = (option: any) => {
    setDisplayValues((prev) => ({
      ...prev,
      flights: { ...prev.flights, destinationDisplay: option.name },
    }));
    setSearchValues((prev) => ({
      ...prev,
      flights: { ...prev.flights, destination: option.id },
    }));
  };

  const handleHotelLocationSelect = (option: any) => {
    setDisplayValues((prev) => ({
      ...prev,
      hotels: { ...prev.hotels, locationDisplay: option.name },
    }));
    setSearchValues((prev) => ({
      ...prev,
      hotels: { ...prev.hotels, location: option.id },
    }));
  };

  const handleCarPickupSelect = (option: any) => {
    setDisplayValues((prev) => ({
      ...prev,
      cars: { ...prev.cars, pickupDisplay: option.name },
    }));
    setSearchValues((prev) => ({
      ...prev,
      cars: { ...prev.cars, pickup: option.id },
    }));
  };

  const handleCarDropoffSelect = (option: any) => {
    setDisplayValues((prev) => ({
      ...prev,
      cars: { ...prev.cars, dropoffDisplay: option.name },
    }));
    setSearchValues((prev) => ({
      ...prev,
      cars: { ...prev.cars, dropoff: option.id },
    }));
  };

  const getFormattedDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Beautiful tropical beach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              Ride the Wave to Your Next Adventure
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 animate-slide-up">
              Search flights, hotels, and cars in seconds
            </p>

            <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto animate-scale-in">
              <div className="flex flex-wrap justify-center mb-6 border-b border-gray-200 dark:border-gray-600">
                {[
                  {
                    key: "flights",
                    label: "Flights",
                    icon: Plane,
                    color: "blue",
                  },
                  {
                    key: "hotels",
                    label: "Hotels",
                    icon: Hotel,
                    color: "green",
                  },
                  { key: "cars", label: "Cars", icon: Car, color: "orange" },
                ].map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`flex items-center space-x-2 px-6 py-3 font-medium rounded-t-lg transition-all duration-200 ${
                      activeTab === key
                        ? `text-${color}-600 dark:text-${color}-400 border-b-2 border-${color}-600 dark:border-${color}-400 bg-${color}-50 dark:bg-${color}-900/20`
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {activeTab === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Autocomplete
                    placeholder="From where?"
                    value={displayValues.flights.originDisplay}
                    onChange={(value) => {
                      setDisplayValues((prev) => ({
                        ...prev,
                        flights: { ...prev.flights, originDisplay: value },
                      }));
                      handleAutocompleteSearch("airport", value);
                    }}
                    onSelect={handleFlightOriginSelect}
                    options={airports.map((airport) => ({
                      id: airport.iata,
                      name: `${airport.name} (${airport.iata})`,
                      secondary: `${airport.city}, ${airport.country}`,
                      icon: <Plane className="w-4 h-4" />,
                    }))}
                    icon={<Plane className="w-5 h-5" />}
                  />
                  <Autocomplete
                    placeholder="To where?"
                    value={displayValues.flights.destinationDisplay}
                    onChange={(value) => {
                      setDisplayValues((prev) => ({
                        ...prev,
                        flights: { ...prev.flights, destinationDisplay: value },
                      }));
                      handleAutocompleteSearch("airport", value);
                    }}
                    onSelect={handleFlightDestinationSelect}
                    options={airports.map((airport) => ({
                      id: airport.iata,
                      name: `${airport.name} (${airport.iata})`,
                      secondary: `${airport.city}, ${airport.country}`,
                      icon: <MapPin className="w-4 h-4" />,
                    }))}
                    icon={<MapPin className="w-5 h-5" />}
                  />
                  <div>
                    <input
                      type="date"
                      value={searchValues.flights.departureDate}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          flights: {
                            ...prev.flights,
                            departureDate: e.target.value,
                          },
                        }))
                      }
                      min={getFormattedDate(today)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={searchValues.flights.returnDate}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          flights: {
                            ...prev.flights,
                            returnDate: e.target.value,
                          },
                        }))
                      }
                      min={
                        searchValues.flights.departureDate ||
                        getFormattedDate(today)
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={handleSearch}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Search Flights</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "hotels" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <Autocomplete
                      placeholder="Where are you going?"
                      value={displayValues.hotels.locationDisplay}
                      onChange={(value) => {
                        setDisplayValues((prev) => ({
                          ...prev,
                          hotels: { ...prev.hotels, locationDisplay: value },
                        }));
                        handleAutocompleteSearch("hotel", value);
                      }}
                      onSelect={handleHotelLocationSelect}
                      options={hotelLocations.map((location) => ({
                        id: location.id,
                        name: location.name,
                        secondary: `${location.city}, ${location.country}`,
                        icon: <MapPin className="w-4 h-4" />,
                      }))}
                      icon={<Hotel className="w-5 h-5" />}
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={searchValues.hotels.checkin}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          hotels: { ...prev.hotels, checkin: e.target.value },
                        }))
                      }
                      min={getFormattedDate(today)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={searchValues.hotels.checkout}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          hotels: { ...prev.hotels, checkout: e.target.value },
                        }))
                      }
                      min={
                        searchValues.hotels.checkin ||
                        getFormattedDate(tomorrow)
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={handleSearch}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Search Hotels</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "cars" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Autocomplete
                    placeholder="Pickup location"
                    value={displayValues.cars.pickupDisplay}
                    onChange={(value) => {
                      setDisplayValues((prev) => ({
                        ...prev,
                        cars: { ...prev.cars, pickupDisplay: value },
                      }));
                      handleAutocompleteSearch("car", value);
                    }}
                    onSelect={handleCarPickupSelect}
                    options={carLocations.map((location) => ({
                      id: location.id,
                      name: location.name,
                      secondary: `${location.city}, ${location.country}`,
                      icon: <MapPin className="w-4 h-4" />,
                    }))}
                    icon={<Car className="w-5 h-5" />}
                  />
                  <Autocomplete
                    placeholder="Drop-off location"
                    value={displayValues.cars.dropoffDisplay}
                    onChange={(value) => {
                      setDisplayValues((prev) => ({
                        ...prev,
                        cars: { ...prev.cars, dropoffDisplay: value },
                      }));
                      handleAutocompleteSearch("car", value);
                    }}
                    onSelect={handleCarDropoffSelect}
                    options={carLocations.map((location) => ({
                      id: location.id,
                      name: location.name,
                      secondary: `${location.city}, ${location.country}`,
                      icon: <MapPin className="w-4 h-4" />,
                    }))}
                    icon={<MapPin className="w-5 h-5" />}
                  />
                  <div>
                    <input
                      type="date"
                      value={searchValues.cars.pickupDate}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          cars: { ...prev.cars, pickupDate: e.target.value },
                        }))
                      }
                      min={getFormattedDate(today)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={searchValues.cars.dropoffDate}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          cars: { ...prev.cars, dropoffDate: e.target.value },
                        }))
                      }
                      min={
                        searchValues.cars.pickupDate || getFormattedDate(today)
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={handleSearch}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Search Cars</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Where to Go Next?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover amazing destinations with great deals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.slice(0, 8).map((destination, index) => (
              <Link
                key={destination.iata}
                to={`/flights?destination=${destination.iata}`}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={
                      destination.image ||
                      `https://images.pexels.com/photos/${
                        1371360 + index
                      }/pexels-photo-${
                        1371360 + index
                      }.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`
                    }
                    alt={destination.city}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {destination.city}
                  </h3>
                  <p className="text-white text-sm opacity-90 mb-2">
                    {destination.country}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xl">
                      ${destination.price}
                    </span>
                    <span className="text-white text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                      From {destination.iata}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why WanderWave?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Travel smarter with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Real-Time Prices
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get the latest prices for flights, hotels, and car rentals from
                multiple providers
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Flexible Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Multi-city trips, price calendars, and flexible date options to
                find the best deals
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Seamless Experience
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                User-friendly interface with responsive design for all your
                devices
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
