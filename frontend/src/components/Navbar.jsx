import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/sales", label: "Sales" },
  { to: "/expenses", label: "Expenses" },
  { to: "/reports", label: "Reports" },
  { to: "/documents", label: "Documents" },
  { to: "/reminders", label: "Reminders" },
  { to: "/chatbot", label: "Chatbot" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-accent bg-primary">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="font-quicksand text-2xl font-bold text-accent">EasyTax</h1>
            <span className="border-2 border-accent px-2 py-0.5 font-mono text-xs font-bold text-accent">
              [TAX]
            </span>
          </div>

          <nav className="hidden items-center gap-5 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-quicksand text-sm font-medium text-white ${isActive ? "nav-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="text-xs text-accent">{user?.shopName || user?.name || "Shop"}</span>
            <button
              type="button"
              onClick={logout}
              className="border-2 border-accent bg-primary px-3 py-1 font-quicksand text-xs font-bold text-accent shadow-brutal transition hover:shadow-brutalSm"
            >
              Logout
            </button>
          </div>

          <button
            type="button"
            className="border-2 border-accent px-2 py-1 text-accent md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-primary"
          onClick={() => setMobileOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
        >
          <div
            className="flex h-full flex-col items-center justify-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="font-quicksand text-3xl font-bold text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <p className="text-sm text-accent">{user?.shopName || user?.name || "Shop"}</p>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="border-2 border-accent bg-primary px-4 py-2 font-quicksand text-lg font-bold text-accent"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
