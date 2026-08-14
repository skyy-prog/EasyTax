import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/reminders", label: "Reminders", icon: CalendarClock },
  { to: "/chatbot", label: "Chatbot", icon: Bot },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = user?.shopName || user?.name || "EasyTax Shop";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ET";

  const navLinkClass = ({ isActive }) =>
    `flex h-11 items-center gap-3 py-3 text-sm font-quicksand font-medium transition-colors ${
      isActive
        ? "border-l-2 border-white pl-[22px] text-white"
        : "pl-6 text-ash hover:text-white"
    }`;

  const navList = (closeOnClick = false) =>
    links.map((link) => {
      const Icon = link.icon;
      return (
        <NavLink
          key={link.to}
          to={link.to}
          className={navLinkClass}
          onClick={() => {
            if (closeOnClick) {
              setMobileOpen(false);
            }
          }}
        >
          <Icon size={16} />
          <span>{link.label}</span>
        </NavLink>
      );
    });

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 border border-smoke bg-charcoal p-2 text-silver md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-smoke bg-charcoal md:flex">
        <div className="px-6 pb-6 pt-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold font-quicksand text-white">EasyTax</h1>
            <span className="ml-2 border border-silver px-1.5 py-0.5 text-[10px] font-mono tracking-widest text-silver">
              [TAX]
            </span>
          </div>
        </div>

        <p className="mb-2 mt-2 px-6 text-[10px] font-mono uppercase tracking-[0.2em] text-ash">
          Navigation
        </p>

        <nav className="flex flex-col">{navList(false)}</nav>

        <div className="mt-auto border-t border-smoke px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke text-xs font-bold font-mono text-white">
              {initials}
            </div>
            <p className="text-sm font-quicksand text-silver">{displayName}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex items-center gap-1 text-xs font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-white"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/95 backdrop-blur-sm md:hidden">
          <aside className="flex h-full w-60 flex-col border-r border-smoke bg-charcoal">
            <div className="flex items-start justify-between px-6 pb-6 pt-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold font-quicksand text-white">EasyTax</h1>
                <span className="ml-2 border border-silver px-1.5 py-0.5 text-[10px] font-mono tracking-widest text-silver">
                  [TAX]
                </span>
              </div>
              <button
                type="button"
                className="text-silver"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-2 mt-2 px-6 text-[10px] font-mono uppercase tracking-[0.2em] text-ash">
              Navigation
            </p>
            <nav className="flex flex-col">{navList(true)}</nav>

            <div className="mt-auto border-t border-smoke px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke text-xs font-bold font-mono text-white">
                  {initials}
                </div>
                <p className="text-sm font-quicksand text-silver">{displayName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="mt-3 inline-flex items-center gap-1 text-xs font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-white"
              >
                <LogOut size={12} />
                Logout
              </button>
            </div>
          </aside>

          <button
            type="button"
            className="absolute inset-y-0 left-60 right-0"
            onClick={() => setMobileOpen(false)}
            aria-label="Close overlay"
          />
        </div>
      )}
    </>
  );
}
