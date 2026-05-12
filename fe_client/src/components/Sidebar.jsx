import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ add useNavigate
import { dummyProfileData } from "../assets/assets";
import {
  CalendarIcon,
  ChevronRightIcon,
  DollarSignIcon,
  FileTextIcon,
  LayoutGridIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

const Sidebar = () => {
  const { pathname } = useLocation(); // ✅ correct
  const navigate = useNavigate(); // ✅ use this instead of window.location

  const [username, setUsername] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUsername(dummyProfileData.firstName + " " + dummyProfileData.lastName);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const role = "" || "EMPLOYEE";

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGridIcon,
    },
    role === "ADMIN"
      ? { name: "Employee", href: "/employees", icon: UserIcon }
      : { name: "Attendance", href: "/attendance", icon: CalendarIcon },
    { name: "Leave", href: "/leave", icon: FileTextIcon },
    { name: "Payslips", href: "/payslips", icon: DollarSignIcon },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <div className="px-5 pt-6 pb-5 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserIcon className="text-white size-7" />
            <div>
              <p className="font-semibold text-[13px] text-white tracking-wide">
                Employee Website
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Management System
              </p>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setMobileOpen(false)}
          >
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {username && (
        <div className="mx-3 mt-4 mb-1 p-3 rounded-lg bg-white/3 border border-white/4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-white/10 shrink-0">
              <span className="text-slate-400 text-xs font-semibold">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-slate-200 truncate">
                {username}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {role === "ADMIN" ? "Administrator" : "Employee"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Navigation
        </p>
      </div>

      <div className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon; // ✅ capitalize for use as JSX component
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 relative ${
                isActive
                  ? "bg-indigo-500/12 text-indigo-300"
                  : "text-slate-300 hover:text-white hover:bg-white/4"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-indigo-500" />
              )}
              <Icon // ✅ use capitalized Icon variable
                className={`w-4.25 h-4.25 shrink-0 ${
                  isActive
                    ? "text-indigo-300"
                    : "text-slate-400 group-hover:text-slate-300"
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRightIcon className="w-3.5 h-3.5 text-indigo-500/50" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/8 transition-all duration-150"
        >
          <LogOutIcon className="w-4.25 h-4.25" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10"
        onClick={() => setMobileOpen(true)}
      >
        <MenuIcon size={20} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" // ✅ fixed: bg:black → bg-black
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className="hidden lg:flex flex-col h-full w-65 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white shrink-0 border-r border-white/4">
        {sidebarContent}
      </aside>

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white z-50 flex flex-col transform transition-transform duration-300 ${
          // ✅ fixed: lgl → lg
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
