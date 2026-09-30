import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sidebarConfig, roleDisplay } from "../../config/sidebarConfig";
import { getFullName } from "../../types";

type Props = {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
};

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, onToggleCollapsed }: Props) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links = sidebarConfig[user.role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderLinks = () =>
    links.map((link) => {
      const isActive = location.pathname === link.path;

      return (
        <Link
          key={link.name}
          to={link.path}
          onClick={() => setIsMobileMenuOpen(false)}
          title={isCollapsed ? link.name : undefined}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? "bg-brand-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <link.icon
            className={`h-5 w-5 ${
              isActive ? "text-white" : "text-slate-400"
            }`}
          />
          {!isCollapsed && link.name}
        </Link>
      );
    });

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-white fixed h-full z-20 transition-all duration-200 ${
          isCollapsed ? "w-20" : "w-60"
        }`}
      >
        <div className={`h-16 flex items-center ${isCollapsed ? "px-4" : "px-6"} py-2 border-b border-slate-800`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-2"} text-brand-400`}>
            <img
              src="/oron-logo.svg"
              alt="Oron logo"
              className="h-9 w-9 rounded-xl ring-1 ring-white/10"
            />
            {!isCollapsed && (
              <span className="text-xl font-bold text-white">
                ORON <span className="text-primary">Care</span>
              </span>
            )}
          </div>
        </div>

        <div className={`${isCollapsed ? "px-4" : "px-6"} py-2 border-b border-slate-800 flex items-center justify-between gap-2`}>
          <div className={`${isCollapsed ? "hidden" : "block"}`}>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
              Portal
            </p>
            <span className="text-sm font-medium">
              {roleDisplay[user.role]}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className={`flex-1 ${isCollapsed ? "px-3" : "px-4"} py-2 space-y-1`}>{renderLinks()}</nav>

        <div className="p-2 border-t border-slate-800">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2`}>
            <div className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={getFullName(user)}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // If avatar fails to load, show initials instead
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
              <span className="text-xs font-semibold text-slate-200">
                {(user.firstName?.[0] || "").toUpperCase()}
                {(user.lastName?.[0] || "").toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-medium">{getFullName(user)}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`mt-2 flex w-full items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2  rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white`}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Mobile */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/80 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 md:hidden flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <img
                  src="/oron-logo.svg"
                  alt="Oron logo"
                  className="h-9 w-9 rounded-xl ring-1 ring-white/10"
                />
                <span className="text-xl font-bold">
                  ORON <span className="text-primary">Care</span>
                </span>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {renderLinks()}
            </nav>
             <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={getFullName(user)}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
              <span className="text-xs font-semibold text-slate-200">
                {(user.firstName?.[0] || "").toUpperCase()}
                {(user.lastName?.[0] || "").toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{getFullName(user)}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 px-3 py-2  rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;