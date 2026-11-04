
import { useEffect, useState } from "react";
import axios from "axios";

import {
    Users,
    UserCheck,
    Building2,
    CalendarCheck,
    ArrowUpRight,
    ArrowRight,
} from "lucide-react";

import "./Dashboard.css";

function Dashboard() {
    const [employees, setEmployees] = useState([]);

    // Fetch employees from backend
    useEffect(() => {
        axios
            .get("http://localhost:8080/api/employees")
            .then((response) => {
                setEmployees(response.data);
            })
            .catch((error) => {
                console.error("Error fetching employees:", error);
            });
    }, []);

    // Calculate dashboard statistics
    const totalEmployees = employees.length;

    const activeEmployees = employees.filter(
        (employee) =>
            employee.status?.toLowerCase() === "active"
    ).length;

    const departments = new Set(
        employees.map((employee) => employee.department)
            .filter(Boolean)
    ).size;

    const stats = [
        {
            title: "Total Employees",
            value: totalEmployees,
            change: "Current workforce",
            icon: Users,
            color: "blue",
        },
        {
            title: "Active Employees",
            value: activeEmployees,
            change: totalEmployees
                ? `${((activeEmployees / totalEmployees) * 100).toFixed(1)}% workforce`
                : "0% workforce",
            icon: UserCheck,
            color: "green",
        },
        {
            title: "Departments",
            value: departments,
            change: "Departments represented",
            icon: Building2,
            color: "purple",
        },
        {
            title: "Attendance Rate",
            value: "96.4%",
            change: "Demo data",
            icon: CalendarCheck,
            color: "orange",
        },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-heading">
                <div>
                    <span className="welcome-label">
                        MONDAY, NOVEMBER 02, 2026
                    </span>
                    <h1>Good afternoon, Admin 👋</h1>
                    <p>Here's what's happening across your organization today.</p>
                </div>

                <button className="report-button">
                    View Reports <ArrowUpRight size={17} />
                </button>
            </div>

            <div className="stats-grid">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div className="stat-card" key={item.title}>
                            <div className={`stat-icon ${item.color}`}>
                                <Icon size={22} />
                            </div>
                            <p>{item.title}</p>
                            <h2>{item.value}</h2>
                            <span className="stat-change">{item.change}</span>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <h3>Workforce Overview</h3>
                            <p>Employee distribution snapshot</p>
                        </div>
                        <span className="panel-badge">Current</span>
                    </div>

                    <div className="overview-content">
                        <div className="overview-circle">
                            <div>
                                <strong>{totalEmployees}</strong>
                                <span>Employees</span>
                            </div>
                        </div>

                        <div className="overview-legend">
                            <div>
                                <span className="legend-dot blue-dot" />
                                Active <strong>{activeEmployees}</strong>
                            </div>
                            <div>
                                <span className="legend-dot green-dot" />
                                Inactive <strong>{totalEmployees - activeEmployees}</strong>
                            </div>
                            <div>
                                <span className="legend-dot purple-dot" />
                                Departments <strong>{departments}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <h3>Quick Actions</h3>
                            <p>Common administrative tasks</p>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button onClick={() => window.location.href = "/employees"}>
                            <Users size={19} />
                            <span>Add / Manage Employees</span>
                            <ArrowRight size={17} />
                        </button>

                        <button onClick={() => window.location.href = "/attendance"}>
                            <CalendarCheck size={19} />
                            <span>Manage Attendance</span>
                            <ArrowRight size={17} />
                        </button>

                        <button onClick={() => window.location.href = "/departments"}>
                            <Building2 size={19} />
                            <span>Manage Departments</span>
                            <ArrowRight size={17} />
                        </button>
                    </div>
                </div>
            </div>



            {employees.slice(-3).reverse().map((employee) => {
                const firstName = employee.firstName || "";
                const lastName = employee.lastName || "";
                const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

                return (
                    <div className="activity-item" key={employee.id}>
                        <div className="activity-avatar blue">
                            {initials}
                        </div>

                        <div>
                            <strong>{firstName} {lastName}</strong>
                            <p>Employee profile created</p>
                        </div>

                        <span>Recently added</span>
                    </div>
                );
            })}


        </div>
    );
}

export default Dashboard;
