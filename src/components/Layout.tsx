import React, { useState, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Activity,
  ClipboardList,
  Settings,
  Bell,
  LogOut,
  Menu,
  BarChart3,
  ShieldAlert,
  FileText,
  HeartPulse,
  Network,
  ChevronRight
} from
  'lucide-react';
import {
  mockAlerts,
  mockFacilities,
  mockBranches,
  mockResidents
} from
  '../mockData';
import { getFullName } from '../types';

export const Layout = ({ children }: { children: React.ReactNode; }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const roleAlerts = mockAlerts.filter(
    (a) => user && a.targetRoles.includes(user.role)
  );
  const unreadAlerts = roleAlerts.filter((a) => a.status === 'Unread');
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const ownerLinks = [
    {
      name: 'Dashboard',
      path: '/owner',
      icon: BarChart3
    },
    {
      name: 'Facilities',
      path: '/owner/facilities',
      icon: Building2
    },
    {
      name: 'Rules Engine',
      path: '/owner/rules',
      icon: Settings
    },
    {
      name: 'Reports',
      path: '/owner/reports',
      icon: FileText
    },
    {
      name: 'Audit Logs',  // Keep this only for owner
      path: '/owner/audit-logs',
      icon: FileText
    }
  ];

  const facilityAdminLinks = [
    {
      name: 'Dashboard',
      path: '/facility-admin',
      icon: BarChart3
    },
    {
      name: 'Branches',
      path: '/facility-admin/branches',
      icon: Network
    },
    {
      name: 'Residents',
      path: '/facility-admin/residents',
      icon: Users
    },
    {
      name: 'Staff',
      path: '/facility-admin/staff',
      icon: Users
    },
    {
      name: 'Reports',
      path: '/facility-admin/reports',
      icon: FileText
    },
    // REMOVED: Audit Logs for facility_admin
    // {
    //   name: 'Audit Logs',
    //   path: '/facility-admin/audit-logs',
    //   icon: FileText
    // },
    {
      name: 'Notifications',
      path: '/facility-admin/notifications',
      icon: Bell
    }
  ];

  const adminLinks = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: BarChart3
    },
    {
      name: 'Residents',
      path: '/admin/residents',
      icon: Users
    },
    {
      name: 'Vitals',
      path: '/admin/vitals',
      icon: Activity
    },
    {
      name: 'Care Plans',
      path: '/admin/care-plans',
      icon: ClipboardList
    },
    {
      name: 'Tasks',
      path: '/admin/tasks',
      icon: ClipboardList
    },
    {
      name: 'Staff',
      path: '/admin/staff',
      icon: Users
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: FileText
    },
    // REMOVED: Audit Logs for admin
    // {
    //   name: 'Audit Logs',
    //   path: '/admin/logs',
    //   icon: FileText
    // },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: Bell
    }
  ];

  const staffLinks = [
    {
      name: 'Dashboard',
      path: '/staff',
      icon: BarChart3
    },
    {
      name: 'My Tasks',
      path: '/staff/tasks',
      icon: ClipboardList
    },
    {
      name: 'Residents',
      path: '/staff/residents',
      icon: Users
    },
    {
      name: 'Enter Vitals',
      path: '/staff/vitals',
      icon: HeartPulse
    },
    {
      name: 'Notifications',
      path: '/staff/notifications',
      icon: Bell
    }  // Audit Logs never existed here
  ];

  const links =
    user?.role === 'owner' ?
      ownerLinks :
      user?.role === 'facility_admin' ?
        facilityAdminLinks :
        user?.role === 'admin' ?
          adminLinks :
          staffLinks;
          
  const roleDisplay = {
    owner: 'Platform Owner',
    facility_admin: 'Facility Admin',
    admin: 'Branch Admin',
    staff: 'Staff'
  };
  
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return null;
    const breadcrumbs = [];
    let currentPath = '';
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      currentPath += `/${path}`;
      let label = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
      // Handle dynamic IDs
      if (path.length > 10) {
        const facility = mockFacilities.find((f) => f.id === path);
        const branch = mockBranches.find((b) => b.id === path);
        const resident = mockResidents.find((r) => r.id === path);
        if (facility) label = facility.name; else
          if (branch) label = branch.name; else
            if (resident) label = getFullName(resident); else
              label = 'Details';
      }
      // Handle roles
      if (path === 'owner') label = 'Platform Owner';
      if (path === 'facility-admin') label = 'Facility Admin';
      if (path === 'admin') label = 'Branch Admin';
      if (path === 'staff') label = 'Staff';
      breadcrumbs.push({
        label,
        path: currentPath
      });
    }
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-20 scrollbar-hide">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-brand-400">
            <Activity className="h-6 w-6" />
            <span className="text-xl font-bold text-white tracking-tight">
              ORON <span className="text-brand-400">Care</span>
            </span>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Portal
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <span className="text-sm font-medium">
              {user ? roleDisplay[user.role] : ''}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-hidden">
          {links.map((link) => {
            const isActive =
              location.pathname === link.path ||
              link.path !== `/${user?.role}` &&
              link.path !== '/facility-admin' &&
              location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <link.icon
                  className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={user?.avatar}
              alt={user ? getFullName(user) : ''}
              className="h-9 w-9 rounded-full border border-slate-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user ? getFullName(user) : ''}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen &&
        <div
          className="fixed inset-0 bg-slate-900/80 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)} />
      }

      {isMobileMenuOpen && (
        <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 md:hidden flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-xl font-bold">
              ORON <span className="text-brand-400">Care</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <link.icon className="h-5 w-5 text-slate-400" />
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <img
                src={user?.avatar}
                alt={user ? getFullName(user) : ''}
                className="h-9 w-9 rounded-full border border-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user ? getFullName(user) : ''}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>

            {breadcrumbs && breadcrumbs.length > 0 &&
              <div className="hidden sm:flex items-center text-sm">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <Fragment key={crumb.path}>
                      {isLast ?
                        <span className="font-semibold text-slate-900">
                          {crumb.label}
                        </span> :
                        <Link
                          to={crumb.path}
                          className="text-slate-500 hover:text-brand-600 transition-colors">
                          {crumb.label}
                        </Link>
                      }
                      {!isLast &&
                        <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
                      }
                    </Fragment>
                  );
                })}
              </div>
            }
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 relative transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-5 w-5" />
                {unreadAlerts.length > 0 &&
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                  </span>
                }
              </button>

              {/* Notifications Dropdown */}
              {showNotifications &&
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Notifications
                    </h3>
                    <span className="text-xs text-brand-600 font-medium cursor-pointer hover:text-brand-700">
                      Mark all read
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {roleAlerts.length > 0 ?
                      roleAlerts.map((alert) =>
                        <div
                          key={alert.id}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${alert.status === 'Unread' ? 'bg-brand-50/30' : ''}`}>
                          <div className="flex gap-3">
                            <div
                              className={`mt-0.5 p-1.5 rounded-full h-fit ${alert.severity === 'Critical' ? 'bg-red-100 text-red-600' : alert.severity === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                              <ShieldAlert className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {alert.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {alert.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(alert.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) :
                      <div className="p-8 text-center text-slate-500 text-sm">
                        No new notifications
                      </div>
                    }
                  </div>
                  <div className="p-3 border-t border-slate-100 text-center">
                    <Link
                      to="#"
                      className="text-xs font-medium text-brand-600 hover:text-brand-700">
                      View all notifications
                    </Link>
                  </div>
                </div>
              }
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};