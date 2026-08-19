import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/useFavorites";

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
});
