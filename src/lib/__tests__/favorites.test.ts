import { describe, it, expect, beforeEach } from "vitest";
import { getFavoriteIds, isFavorite, addFavorite, removeFavorite, toggleFavorite } from "@/lib/favorites";

beforeEach(() => {
  localStorage.clear();
});

describe("favorites storage", () => {
  it("starts empty", () => {
    expect(getFavoriteIds()).toEqual([]);
  });

  it("adds a favorite", () => {
    addFavorite("multnomah-falls");
    expect(getFavoriteIds()).toEqual(["multnomah-falls"]);
    expect(isFavorite("multnomah-falls")).toBe(true);
  });

  it("does not duplicate an existing favorite", () => {
    addFavorite("multnomah-falls");
    addFavorite("multnomah-falls");
    expect(getFavoriteIds()).toEqual(["multnomah-falls"]);
  });

  it("removes a favorite", () => {
    addFavorite("multnomah-falls");
    removeFavorite("multnomah-falls");
    expect(getFavoriteIds()).toEqual([]);
    expect(isFavorite("multnomah-falls")).toBe(false);
  });

  it("toggles a favorite on and off, returning the new list", () => {
    expect(toggleFavorite("smith-rock")).toEqual(["smith-rock"]);
    expect(toggleFavorite("smith-rock")).toEqual([]);
  });
});
