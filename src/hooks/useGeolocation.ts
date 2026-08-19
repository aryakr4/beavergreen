"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/lib/types";

export interface GeolocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ coords: null, loading: false, error: "Geolocation is not available in this browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: { lat: position.coords.latitude, lng: position.coords.longitude },
          loading: false,
          error: null,
        });
      },
      () => {
        setState({
          coords: null,
          loading: false,
          error: "Enable location access to see distance from you.",
        });
      }
    );
  }, []);

  return state;
}
