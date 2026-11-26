import React, {useState} from "react";
import {vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {ConfirmDialog, ConfirmDialogProps} from "./ConfirmDialog";

const renderDialog = (props: Partial<ConfirmDialogProps> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<ConfirmDialog tone="danger" title="Reset this page?" confirmLabel="Reset"
                        onConfirm={onConfirm} onCancel={onCancel} {...props}/>);
  return {onConfirm, onCancel};
};

describe("ConfirmDialog", () => {
  test("is a modal alertdialog named by its title", () => {
    renderDialog();
    const dialog = screen.getByRole("alertdialog", {name: "Reset this page?"});
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test.each([
    ["with a body", "Everything on this page goes back to its defaults.", "Everything on this page goes back to its defaults."],
    ["without a body", undefined, ""],
  ])("is described by its body only when it has one (%s)", (_, body, description) => {
    renderDialog({body});
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAccessibleDescription(description);
    expect(dialog.hasAttribute("aria-describedby")).toBe(Boolean(body));
    expect(dialog.querySelectorAll("p")).toHaveLength(body ? 1 : 0);
  });

  test.each([
    ["danger", 1],
    ["neutral", 0],
  ] as const)("shows the warning icon only for the danger tone (%s)", (tone, icons) => {
    renderDialog({tone});
    expect(screen.getByRole("alertdialog").querySelectorAll("svg[aria-hidden='true']")).toHaveLength(icons);
  });

  test("focuses the confirm button when it opens", () => {
    renderDialog({confirmLabel: "Delete"});
    expect(screen.getByRole("button", {name: "Delete"})).toHaveFocus();
  });

  test("runs the action when the confirm button is clicked", () => {
    const {onConfirm, onCancel} = renderDialog();
    fireEvent.click(screen.getByRole("button", {name: "Reset"}));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  test.each([
    ["the Cancel button", () => fireEvent.click(screen.getByRole("button", {name: "Cancel"}))],
    ["Escape", () => fireEvent.keyDown(screen.getByRole("button", {name: "Reset"}), {key: "Escape"})],
    ["a click on the backdrop", () => fireEvent.click(screen.getByRole("alertdialog").parentElement!)],
  ])("cancels without running the action on %s", (_, cancel) => {
    const {onConfirm, onCancel} = renderDialog();
    cancel();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("does not close on a click inside the panel", () => {
    const {onConfirm, onCancel} = renderDialog();
    fireEvent.click(screen.getByRole("heading", {name: "Reset this page?"}));
    fireEvent.click(screen.getByRole("alertdialog"));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  // Profile.tsx and FavoriteDetailsDialog close their own popups on a window-level Escape
  test("keeps Escape from reaching window keydown listeners", () => {
    const windowEscape = vi.fn();
    window.addEventListener("keydown", windowEscape);
    try {
      renderDialog();
      fireEvent.keyDown(screen.getByRole("button", {name: "Reset"}), {key: "Escape"});
      expect(windowEscape).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("keydown", windowEscape);
    }
  });

  test.each([
    ["Tab from the confirm button", "Reset", false, "Cancel"],
    ["Shift+Tab from Cancel", "Cancel", true, "Reset"],
  ])("keeps focus inside the dialog on %s", (_, from, shiftKey, to) => {
    renderDialog();
    const start = screen.getByRole("button", {name: from});
    start.focus();
    fireEvent.keyDown(start, {key: "Tab", shiftKey});
    expect(screen.getByRole("button", {name: to})).toHaveFocus();
  });

  test("returns focus to the control that opened it when cancelled", () => {
    const Opener = () => {
      const [open, setOpen] = useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Open</button>
        {open && <ConfirmDialog tone="neutral" title="Discard changes to this favorite?" confirmLabel="Discard"
                                onConfirm={() => setOpen(false)} onCancel={() => setOpen(false)}/>}
      </>;
    };
    render(<Opener/>);
    const opener = screen.getByRole("button", {name: "Open"});
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
    expect(opener).toHaveFocus();
  });
});
