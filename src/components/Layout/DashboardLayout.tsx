import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { useAlertsRealtime } from "../../hooks/useAlertsRealtime";

const DashboardLayout = () => {
  useAlertsRealtime();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("oron_sidebar_collapsed");
    if (stored === "1") setIsSidebarCollapsed(true);
  }, []);

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("oron_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
      />

      <main
        className={`flex-1 flex flex-col min-h-screen min-w-0 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-60"
        }`}
      >
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
         <Outlet/>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;