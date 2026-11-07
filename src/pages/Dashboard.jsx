
import { useEffect, useState } from "react";
import axios from "axios";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);


import {
    Users,
    UserCheck,
    Building2,
    CalendarCheck,
    ArrowUpRight,
    ArrowRight,
    UserPlus,
    UserPen,
    UserMinus,
    Camera,
    Activity,
} from "lucide-react";

import "./Dashboard.css";

const API_URL = "http://localhost:8080";

function Dashboard() {
    const [employees, setEmployees] = useState([]);
    const [activities, setActivities] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`${API_URL}/api/employees`)
            .then((response) => setEmployees(response.data))
            .catch((error) =>
                console.error("Error fetching employees:", error)
            );

        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/activities`);
            const sortedActivities = response.data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setActivities(sortedActivities.slice(0, 8));
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setActivityLoading(false);
        }
    };

    const totalEmployees = employees.length;

    const activeEmployees = employees.filter(
        (employee) => employee.status?.toLowerCase() === "active"
    ).length;

    const departments = new Set(
        employees.map((employee) => employee.department).filter(Boolean)
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

    // Employee Status Chart
    const statusChartData = {
        labels: ["Active", "Inactive"],
        datasets: [
            {
                data: [
                    activeEmployees,
                    totalEmployees - activeEmployees,
                ],
                backgroundColor: ["#4ade80", "#64748b"],
                borderColor: "#101925",
                borderWidth: 3,
            },
        ],
    };

    // Department Distribution Chart
    const departmentCounts = employees.reduce((acc, employee) => {
        const department = employee.department || "Unassigned";
        acc[department] = (acc[department] || 0) + 1;
        return acc;
    }, {});

    const departmentChartData = {
        labels: Object.keys(departmentCounts),
        datasets: [
            {
                label: "Employees",
                data: Object.values(departmentCounts),
                backgroundColor: [
                    "#60a5fa",
                    "#4ade80",
                    "#c084fc",
                    "#fb923c",
                    "#45e1cf",
                    "#f472b6",
                ],
                borderRadius: 6,
            },
        ],
    };


    const getActivityIcon = (action) => {
        switch (action) {
            case "EMPLOYEE_CREATED":
                return UserPlus;
            case "EMPLOYEE_UPDATED":
                return UserPen;
            case "EMPLOYEE_DELETED":
                return UserMinus;
            case "PROFILE_PHOTO_UPLOADED":
            case "PROFILE_PHOTO_REMOVED":
                return Camera;
            default:
                return Activity;
        }
    };

    const getActivityTitle = (action) => {
        switch (action) {
            case "EMPLOYEE_CREATED":
                return "Employee created";
            case "EMPLOYEE_UPDATED":
                return "Employee updated";
            case "EMPLOYEE_DELETED":
                return "Employee deleted";
            case "PROFILE_PHOTO_UPLOADED":
                return "Profile photo uploaded";
            case "PROFILE_PHOTO_REMOVED":
                return "Profile photo removed";
            default:
                return action?.replaceAll("_", " ") || "Activity";
        }
    };

    const formatActivityDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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

            {/* Analytics Charts */}
            <div className="analytics-grid">
                <div className="dashboard-panel chart-panel">
                    <div className="panel-heading">
                        <div>
                            <h3>Employee Status</h3>
                            <p>Active vs inactive employees</p>
                        </div>
                    </div>

                    <div className="chart-container doughnut-container">
                        <Doughnut
                            data={statusChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: "bottom",
                                        labels: {
                                            color: "#a7b7ca",
                                            padding: 20,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="dashboard-panel chart-panel">
                    <div className="panel-heading">
                        <div>
                            <h3>Department Distribution</h3>
                            <p>Employees across departments</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <Bar
                            data={departmentChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                                scales: {
                                    x: {
                                        ticks: {
                                            color: "#8192a8",
                                        },
                                        grid: {
                                            display: false,
                                        },
                                    },
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: "#8192a8",
                                            precision: 0,
                                        },
                                        grid: {
                                            color: "#253141",
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-panel recent-activity-panel">
                <div className="panel-heading">
                    <div>
                        <h3>Recent Activity</h3>
                        <p>Latest employee actions across your organization</p>
                    </div>
                    <span className="panel-badge">Live Data</span>
                </div>

                <div className="recent-activity-list">
                    {activityLoading ? (
                        <p className="activity-empty">Loading activities...</p>
                    ) : activities.length === 0 ? (
                        <p className="activity-empty">No activities recorded yet.</p>
                    ) : (
                        activities.map((item) => {
                            const Icon = getActivityIcon(item.action);

                            return (
                                <div className="activity-item" key={item.id}>
                                    <div className="activity-avatar blue">
                                        <Icon size={18} />
                                    </div>

                                    <div className="activity-details">
                                        <strong>{item.employeeName || "Employee"}</strong>
                                        <p>{getActivityTitle(item.action)}</p>
                                        <span>{item.description}</span>
                                    </div>

                                    <div className="activity-meta">
                                        <span>{formatActivityDate(item.createdAt)}</span>
                                        <small>By {item.performedBy || "Admin"}</small>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
