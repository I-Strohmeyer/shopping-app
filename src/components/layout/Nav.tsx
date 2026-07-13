import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Settings, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

interface NavProps {
  onNewList: () => void;
}

export function Nav({ onNewList }: NavProps) {
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", icon: ShoppingCart, label: "Lists" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* ── Mobile: fixed bottom bar ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-300 flex items-center justify-around h-16 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-colors",
            pathname === "/"
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          <ShoppingCart size={22} />
          <span className="text-[10px] font-medium">Lists</span>
        </Link>

        <button
          onClick={onNewList}
          className="flex items-center justify-center w-12 h-12 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200/60 hover:bg-emerald-600 active:bg-emerald-700 transition-colors -mt-4"
          aria-label="New list"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>

        <Link
          to="/settings"
          className={cn(
            "flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-colors",
            pathname === "/settings"
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          <Settings size={22} />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </nav>

      {/* ── Desktop: fixed left sidebar ── */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-slate-300 flex-col z-40">
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">Shopping List</span>
          </div>
        </div>

        <div className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === to
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <button
            onClick={onNewList}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Plus size={18} />
            New List
          </button>
        </div>
      </nav>
    </>
  );
}
