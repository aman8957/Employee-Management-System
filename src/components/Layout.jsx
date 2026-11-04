
import { NavLink } from "react-router-dom";
import {
    Activity,
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    ClipboardList,
    ChartColumn,
    Settings,
    Bell,
    Search,
} from "lucide-react";

import "./Layout.css";

function Layout({ children }) {
    const navigation = [
        { name: "Overview", path: "/", icon: LayoutDashboard },
        { name: "Employees", path: "/employees", icon: Users },
        { name: "Departments", path: "/departments", icon: Building2 },
        { name: "Attendance", path: "/attendance", icon: CalendarCheck },
        { name: "Leave Management", path: "/leaves", icon: ClipboardList },
        { name: "Analytics", path: "/analytics", icon: ChartColumn },
    ];

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">
                        <Activity size={23} />
                    </div>
                    <div>
                        <span className="brand-name">PeoplePulse</span>
                        <small>WORKFORCE INTELLIGENCE</small>
                    </div>
                </div>

                <div className="workspace">
                    <span className="workspace-dot"></span>
                    <span>Acme Workspace</span>
                    <span className="workspace-menu">•••</span>
                </div>

                <p className="menu-label">WORKSPACE</p>

                <nav className="sidebar-nav">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? "active" : ""}`
                                }
                            >
                                <Icon size={19} />
                                <span>{item.name}</span>
                                {item.name === "Employees" && (
                                    <span className="employee-count">05</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <p className="menu-label preferences-label">PREFERENCES</p>

                <NavLink to="/settings" className="nav-item">
                    <Settings size={19} />
                    <span>Settings</span>
                </NavLink>

                <div className="sidebar-profile">
                    <div className="profile-avatar">HR</div>
                    <div>
                        <strong>Admin User</strong>
                        <small>Administrator</small>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div className="breadcrumb">
                        <span>Workspace</span>
                        <span>/</span>
                        <strong>Overview</strong>
                    </div>

                    <div className="top-actions">
                        <div className="global-search">
                            <Search size={17} />
                            <input placeholder="Search anything..." />
                        </div>

                        <button className="notification-button">
                            <Bell size={19} />
                            <span className="notification-dot"></span>
                        </button>

                        <div className="top-avatar">HR</div>
                    </div>
                </header>

                <div className="page-content">{children}</div>
            </main>
        </div>
    );
}

export default Layout;
