import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGeolocation } from "@/hooks/useGeolocation";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGeolocation", () => {
  it("resolves coordinates on success", async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: { latitude: 45.5, longitude: -122.5 },
      } as GeolocationPosition);
    });
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.coords).toEqual({ lat: 45.5, lng: -122.5 });
    expect(result.current.error).toBeNull();
  });

  it("sets an error message when permission is denied", async () => {
    const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: "denied" } as GeolocationPositionError);
    });
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it("sets an error message when geolocation is unavailable", async () => {
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBe("Geolocation is not available in this browser.");
  });
});
