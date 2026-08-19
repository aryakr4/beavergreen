import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterBar from "@/components/FilterBar";
import type { LocationFilters } from "@/lib/filters";

describe("FilterBar", () => {
  it("calls onChange with the selected category", () => {
    const onChange = vi.fn();
    const filters: LocationFilters = {};
    render(<FilterBar filters={filters} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "waterfall" } });
    expect(onChange).toHaveBeenCalledWith({ category: "waterfall" });
  });

  it("calls onChange with the selected state", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: "WA" } });
    expect(onChange).toHaveBeenCalledWith({ state: "WA" });
  });

  it("clears a filter when set back to 'any'", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{ category: "waterfall" }} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("updates the max distance filter", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/max distance/i), { target: { value: "25" } });
    expect(onChange).toHaveBeenCalledWith({ maxDistanceMiles: 25 });
  });

  it("disables only the max distance input when disabled is true", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} disabled />);

    expect(screen.getByLabelText(/max distance/i)).toBeDisabled();
    expect(screen.getByLabelText(/category/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/state/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/difficulty/i)).not.toBeDisabled();
  });
});
