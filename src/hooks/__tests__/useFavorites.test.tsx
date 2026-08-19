import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/useFavorites";
import { addFavorite } from "@/lib/favorites";

beforeEach(() => {
  localStorage.clear();
});

describe("useFavorites", () => {
  it("reflects toggled favorites in state", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favoriteIds).toEqual([]);

    act(() => result.current.toggleFavorite("ruby-beach"));
    expect(result.current.favoriteIds).toEqual(["ruby-beach"]);
    expect(result.current.isFavorite("ruby-beach")).toBe(true);

    act(() => result.current.toggleFavorite("ruby-beach"));
    expect(result.current.favoriteIds).toEqual([]);
  });

  it("does not re-render when the snapshot is read repeatedly without changes", () => {
    const { result, rerender } = renderHook(() => useFavorites());
    const firstIds = result.current.favoriteIds;
    rerender();
    expect(result.current.favoriteIds).toBe(firstIds);
  });

  it("picks up favorites changed in another tab via the storage event", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favoriteIds).toEqual([]);

    act(() => {
      addFavorite("smith-rock");
      window.dispatchEvent(new Event("storage"));
    });

    expect(result.current.favoriteIds).toEqual(["smith-rock"]);
  });
});
