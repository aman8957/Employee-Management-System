
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Briefcase,
    Building2,
    UserRound,
    ShieldCheck,
} from "lucide-react";

import "./EmployeeDetails.css";

const API_URL = "http://localhost:8080/api/employees";

export default function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await fetch(`${API_URL}/${id}`);

                if (!response.ok) {
                    throw new Error("Employee not found");
                }

                const data = await response.json();

                setEmployee({
                    ...data,
                    name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    if (loading) {
        return <div className="employee-details-page">Loading employee...</div>;
    }

    if (error || !employee) {
        return (
            <div className="employee-details-page">
                <button onClick={() => navigate("/employees")}>
                    <ArrowLeft size={16} /> Back to Employees
                </button>
                <p>{error || "Employee not found"}</p>
            </div>
        );
    }

    const initials = employee.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="employee-details-page">
            <button
                className="employee-back-btn"
                onClick={() => navigate("/employees")}
            >
                <ArrowLeft size={17} />
                Back to Employees
            </button>

            <div className="employee-profile-header">
                <div className="employee-profile-avatar">{initials}</div>

                <div className="employee-profile-info">
                    <h1>{employee.name}</h1>
                    <p>{employee.designation || "Employee"}</p>

                    <span className={`employee-profile-status ${employee.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                        {employee.status}
                    </span>
                </div>
            </div>

            <div className="employee-profile-grid">
                <div className="employee-profile-card">
                    <div className="profile-card-heading">
                        <UserRound size={19} />
                        <h3>Personal Information</h3>
                    </div>

                    <div className="profile-detail">
                        <span>Full Name</span>
                        <strong>{employee.name}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Email Address</span>
                        <strong>{employee.email}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Employee ID</span>
                        <strong>EMP-{String(employee.id).padStart(4, "0")}</strong>
                    </div>
                </div>

                <div className="employee-profile-card">
                    <div className="profile-card-heading">
                        <Briefcase size={19} />
                        <h3>Employment Information</h3>
                    </div>

                    <div className="profile-detail">
                        <span>Designation</span>
                        <strong>{employee.designation || "Not specified"}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Department</span>
                        <strong>{employee.department || "Not assigned"}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Employment Status</span>
                        <strong>{employee.status || "Not specified"}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
