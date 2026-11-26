import React from "react";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {MemoryRouter, useLocation} from "react-router-dom";
import {PageLink} from "./PageLink";

const CurrentLocation = () => {
  const location = useLocation();
  return <output>{location.pathname + location.search}</output>;
};

const renderWhileEditingFavorite = () => render(
  <MemoryRouter initialEntries={["/maps?favorite=abc"]}>
    <PageLink text="Heist" icon="" route="/heist" currentPage="/maps"/>
    <CurrentLocation/>
  </MemoryRouter>
);

describe("PageLink while editing a favorite", () => {
  test("stays on the page when the discard dialog is cancelled", () => {
    renderWhileEditingFavorite();
    fireEvent.click(screen.getByRole("link", {name: /Heist/}));
    fireEvent.click(within(screen.getByRole("alertdialog", {name: "Discard changes to this favorite?"})).getByRole("button", {name: "Cancel"}));
    expect(screen.getByRole("status")).toHaveTextContent("/maps?favorite=abc");
  });

  test("navigates to the clicked page when the discard dialog is confirmed", () => {
    renderWhileEditingFavorite();
    fireEvent.click(screen.getByRole("link", {name: /Heist/}));
    expect(screen.getByRole("status")).toHaveTextContent("/maps?favorite=abc");
    fireEvent.click(screen.getByRole("button", {name: "Discard"}));
    expect(screen.getByRole("status")).toHaveTextContent(/^\/heist$/);
  });
});
