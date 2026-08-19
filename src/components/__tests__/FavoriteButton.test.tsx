import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FavoriteButton from "@/components/FavoriteButton";

beforeEach(() => localStorage.clear());

describe("FavoriteButton", () => {
  it("toggles between 'Save' and 'Saved' on click", () => {
    render(<FavoriteButton locationId="multnomah-falls" />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(/save/i);

    fireEvent.click(button);
    expect(button).toHaveTextContent(/saved/i);

    fireEvent.click(button);
    expect(button).toHaveTextContent(/^save$/i);
  });
});
