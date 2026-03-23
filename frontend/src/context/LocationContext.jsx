import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { formatCityLabel, getCityName, getUserLocation } from "../services/api";

const LOCATION_STORAGE_KEY = "locationData";

const readStoredLocation = () => {
  const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!raw) {
    return {
      isLocationEnabled: false,
      locationCoords: null,
      cityName: ""
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      isLocationEnabled: Boolean(parsed?.isLocationEnabled),
      locationCoords: parsed?.locationCoords || null,
      cityName: parsed?.cityName || ""
    };
  } catch {
    return {
      isLocationEnabled: false,
      locationCoords: null,
      cityName: ""
    };
  }
};

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const stored = readStoredLocation();
  const [isLocationEnabled, setIsLocationEnabled] = useState(stored.isLocationEnabled);
  const [locationCoords, setLocationCoords] = useState(stored.locationCoords);
  const [cityName, setCityName] = useState(stored.cityName);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({
        isLocationEnabled,
        locationCoords,
        cityName
      })
    );
  }, [isLocationEnabled, locationCoords, cityName]);

  const enableLiveLocation = async () => {
    setLocationLoading(true);
    setLocationError("");

    try {
      const location = await getUserLocation();
      if (!location || location.source !== "live") {
        throw new Error("Unable to access live location. Please allow location permission.");
      }

      const coords = { lat: Number(location.lat), lon: Number(location.lon) };
      setIsLocationEnabled(true);
      setLocationCoords(coords);

      const place = await getCityName(coords.lat, coords.lon);
      setCityName(formatCityLabel(place || {}));
    } catch (error) {
      setIsLocationEnabled(false);
      setLocationCoords(null);
      setCityName("");
      setLocationError(error.message || "Unable to fetch location");
    } finally {
      setLocationLoading(false);
    }
  };

  const disableLiveLocation = () => {
    setIsLocationEnabled(false);
    setLocationCoords(null);
    setCityName("");
    setLocationError("");
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      isLocationEnabled,
      locationCoords,
      cityName,
      locationLoading,
      locationError,
      enableLiveLocation,
      disableLiveLocation
    }),
    [isLocationEnabled, locationCoords, cityName, locationLoading, locationError]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationState = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationState must be used inside LocationProvider");
  }
  return context;
};
