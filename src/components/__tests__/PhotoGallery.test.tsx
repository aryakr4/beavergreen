import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PhotoGallery from "@/components/PhotoGallery";

describe("PhotoGallery", () => {
  it("renders one image per photo", () => {
    render(<PhotoGallery photos={["/images/a.jpg", "/images/b.jpg"]} alt="Test Spot" />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("falls back to the placeholder when given no photos", () => {
    render(<PhotoGallery photos={[]} alt="Test Spot" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });

  it("swaps a photo to the placeholder if it fails to load", () => {
    render(<PhotoGallery photos={["/images/broken.jpg"]} alt="Test Spot" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("broken.jpg"));

    fireEvent.error(img);
    expect(img).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });
});
