import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { addFavorite } from "@/lib/favorites";
import PassportPage from "@/app/passport/page";

beforeEach(() => localStorage.clear());

describe("Passport page", () => {
  it("shows an empty state with no favorites", () => {
    render(<PassportPage />);
    expect(screen.getByText(/haven't saved any spots yet/i)).toBeInTheDocument();
  });

  it("lists favorited locations and stats once favorites exist", () => {
    addFavorite("multnomah-falls");
    addFavorite("smith-rock");
    render(<PassportPage />);
    expect(screen.getByText("Multnomah Falls")).toBeInTheDocument();
    expect(screen.getByText("Smith Rock State Park")).toBeInTheDocument();
    expect(screen.getByText(/2 spots saved/i)).toBeInTheDocument();
  });
});
