import "@testing-library/jest-dom/vitest";
import * as React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchFilter } from "./search-filter";
import { DataTable } from "./data-table";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const advance = (time = 300) =>
  act(() => {
    vi.advanceTimersByTime(time);
  });
const columns = [{ key: "name", header: "Name", accessor: "name" as const }];
const rows = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
];
const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };

describe("SearchFilter", () => {
  it("clears an unsent edit even if the parent's query is already empty", () => {
    const changed = vi.fn();
    const cleared = vi.fn();
    render(<SearchFilter searchValue="" onSearchChange={changed} onClearAll={cleared}
      filters={[{ key: "status", label: "Status", value: "active", options: [{ value: "active", label: "Active" }] }]} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "stale" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    advance();
    expect(changed).not.toHaveBeenCalled();
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("emits only the last user edit, without replay on mount or callback replacement", () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = render(
      <SearchFilter searchValue="saved" onSearchChange={first} />,
    );
    advance();
    expect(first).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    advance(100);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "alpha" },
    });
    advance(200);
    view.rerender(<SearchFilter searchValue="saved" onSearchChange={second} />);
    advance(100);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith("alpha");
    advance();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending edit when the parent resets the search or the control unmounts", () => {
    const changed = vi.fn();
    const view = render(
      <SearchFilter searchValue="saved" onSearchChange={changed} />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "old edit" },
    });
    view.rerender(<SearchFilter searchValue="" onSearchChange={changed} />);
    advance();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveValue("");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "another" },
    });
    view.unmount();
    advance();
    expect(changed).not.toHaveBeenCalled();
  });
});

describe("DataTable", () => {
  it("accepts an external query/reset without echoing or restoring stale text", () => {
    const changed = vi.fn();
    const props = {
      columns,
      data: rows,
      pagination,
      onPaginationChange: vi.fn(),
      onSearch: changed,
    };
    const view = render(<DataTable {...props} searchValue="saved" />);
    expect(screen.getByRole("searchbox")).toHaveValue("saved");
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "pending" },
    });
    view.rerender(<DataTable {...props} searchValue="reset" />);
    advance();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole("searchbox")).toHaveValue("reset");
  });

  it("keeps actions after the fourth column available in mobile cards", () => {
    const edit = vi.fn();
    const mobileColumns = [
      ...Array.from({ length: 4 }, (_, index) => ({
        key: String(index),
        header: `Field ${index}`,
        accessor: "name" as const,
      })),
      {
        key: "actions",
        header: "Actions",
        cell: () => <button onClick={edit}>Edit record</button>,
      },
    ];
    render(
      <DataTable
        columns={mobileColumns}
        data={[rows[0]]}
        pagination={pagination}
        onPaginationChange={vi.fn()}
      />,
    );
    fireEvent.click(
      within(screen.getByRole("article")).getByRole("button", {
        name: "Edit record",
      }),
    );
    expect(edit).toHaveBeenCalledTimes(1);
  });

  it("does not reset the parent's query when it mounts", () => {
    const changed = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={rows}
        pagination={pagination}
        onPaginationChange={vi.fn()}
        onSearch={changed}
      />,
    );
    advance();
    expect(changed).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "alpha" },
    });
    advance();
    expect(changed).toHaveBeenCalledExactlyOnceWith("alpha");
  });

  it("does not repeat selection notifications for equivalent data or callback replacement", () => {
    const changed = vi.fn();
    const view = render(
      <DataTable
        columns={columns}
        data={rows}
        pagination={pagination}
        onPaginationChange={vi.fn()}
        onSelectionChange={changed}
      />,
    );
    changed.mockClear();
    fireEvent.click(
      screen.getAllByRole("checkbox", { name: "Select Record 1" })[0],
    );
    expect(changed).toHaveBeenCalledExactlyOnceWith(["a"]);
    changed.mockClear();
    view.rerender(
      <DataTable
        columns={columns}
        data={[...rows]}
        pagination={pagination}
        onPaginationChange={vi.fn()}
        onSelectionChange={(ids) => changed(ids)}
      />,
    );
    expect(changed).not.toHaveBeenCalled();
    view.rerender(
      <DataTable
        columns={columns}
        data={[rows[1]]}
        pagination={pagination}
        onPaginationChange={vi.fn()}
        onSelectionChange={(ids) => changed(ids)}
      />,
    );
    expect(changed).toHaveBeenCalledExactlyOnceWith([]);
  });
});
