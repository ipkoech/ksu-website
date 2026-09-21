import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImagePicker } from "./image-picker";

afterEach(cleanup);

describe("ImagePicker preview ownership", () => {
  it("revokes an upload preview when the picker unmounts", async () => {
    const previousCreate = URL.createObjectURL;
    const previousRevoke = URL.revokeObjectURL;
    const createObjectURL = vi.fn(() => "blob:picker-preview");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    const onChange = vi.fn();

    try {
      const { unmount } = render(<ImagePicker onChange={onChange} />);
      fireEvent.click(screen.getByRole("button", { name: "Choose image" }));
      const input = screen
        .getByText("Upload new image")
        .parentElement?.querySelector('input[type="file"]');
      expect(input).toBeTruthy();
      fireEvent.change(input!, {
        target: {
          files: [new File(["image"], "preview.png", { type: "image/png" })],
        },
      });

      await waitFor(() =>
        expect(onChange).toHaveBeenCalledWith("blob:picker-preview"),
      );
      unmount();

      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:picker-preview");
    } finally {
      if (previousCreate) {
        Object.defineProperty(URL, "createObjectURL", {
          configurable: true,
          value: previousCreate,
        });
      } else {
        Reflect.deleteProperty(URL, "createObjectURL");
      }
      if (previousRevoke) {
        Object.defineProperty(URL, "revokeObjectURL", {
          configurable: true,
          value: previousRevoke,
        });
      } else {
        Reflect.deleteProperty(URL, "revokeObjectURL");
      }
    }
  });
});
