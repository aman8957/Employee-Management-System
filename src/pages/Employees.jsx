import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    UserPlus,
    Download,
    Pencil,
    Trash2,
    X,
    Users,
    Filter,
} from "lucide-react";

import "./Employees.css";

const API_URL = "http://localhost:8080/api/employees";
const DEPARTMENT_API = "http://localhost:8080/api/departments";

const emptyForm = {
    name: "",
    email: "",
    department: "",
    role: "",
    status: "Active",
};

const getInitials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const mapEmployee = (employee) => ({
    id: employee.id,
    name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
    email: employee.email || "",
    department: employee.department || "",
    role: employee.designation || "",
    status: employee.status || "Active",
});

const Employees = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 10;

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch Employees
    const fetchEmployees = async () => {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to fetch employees");
            }

            const data = await response.json();
            setEmployees(data.map(mapEmployee));
            setError("");
        } catch (err) {
            setError(err.message || "Unable to load employees");
        }
    };

    // Fetch Departments
    const fetchDepartments = async () => {
        try {
            const response = await fetch(DEPARTMENT_API);

            if (!response.ok) {
                throw new Error("Failed to fetch departments");
            }

            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error("Department loading error:", err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    // Search + Department + Status Filter
    const filteredEmployees = employees.filter((employee) => {
        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            employee.name.toLowerCase().includes(searchText) ||
            employee.email.toLowerCase().includes(searchText) ||
            employee.role.toLowerCase().includes(searchText);

        const matchesDepartment =
            departmentFilter === "All" ||
            employee.department === departmentFilter;

        const matchesStatus =
            statusFilter === "All" ||
            employee.status === statusFilter;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(
        filteredEmployees.length / employeesPerPage
    );

    const startIndex = (currentPage - 1) * employeesPerPage;

    const paginatedEmployees = filteredEmployees.slice(
        startIndex,
        startIndex + employeesPerPage
    );

    const startEmployee =
        filteredEmployees.length === 0 ? 0 : startIndex + 1;

    const endEmployee = Math.min(
        startIndex + employeesPerPage,
        filteredEmployees.length
    );

    // Reset page if employees decrease
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // Open Add Modal
    const openAddModal = () => {
        setEditingId(null);

        setForm({
            ...emptyForm,
            department: departments[0]?.name || "",
        });

        setError("");
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (employee) => {
        setEditingId(employee.id);

        setForm({
            name: employee.name,
            email: employee.email,
            department: employee.department,
            role: employee.role,
            status: employee.status,
        });

        setError("");
        setShowModal(true);
    };

    // Automatically open Edit Modal from Employee Profile
    useEffect(() => {
        const editId = searchParams.get("edit");

        if (!editId || employees.length === 0) return;

        const employee = employees.find(
            (item) => String(item.id) === String(editId)
        );

        if (employee) {
            openEditModal(employee);

            // Remove edit query from URL
            setSearchParams({}, { replace: true });
        }
    }, [employees, searchParams, setSearchParams]);

    // Close Modal
    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm);
        setError("");
    };

    // Form Change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Add / Update Employee
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        const nameParts = form.name.trim().split(/\s+/);

        const payload = {
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" "),
            email: form.email.trim(),
            department: form.department,
            designation: form.role.trim(),
            status: form.status,
        };

        try {
            const response = await fetch(
                editingId ? `${API_URL}/${editingId}` : API_URL,
                {
                    method: editingId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to save employee");
            }

            await fetchEmployees();
            setCurrentPage(1);
            closeModal();
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Delete Employee
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete employee");
            }

            await fetchEmployees();
        } catch (err) {
            alert(err.message || "Unable to delete employee");
        }
    };

    // Export CSV
    const handleExport = () => {
        const headers = [
            "ID",
            "Name",
            "Email",
            "Department",
            "Designation",
            "Status",
        ];

        const rows = filteredEmployees.map((employee) => [
            employee.id,
            employee.name,
            employee.email,
            employee.department,
            employee.role,
            employee.status,
        ]);

        const csvContent = [headers, ...rows]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value ?? "").replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "employees.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="employee-page">

            {/* PAGE HEADER */}
            <div className="employee-page-heading">
                <div>
                    <span className="employee-eyebrow">
                        WORKFORCE MANAGEMENT
                    </span>

                    <h1>Employee Directory</h1>

                    <p>Manage and organize your workforce</p>
                </div>

                <div className="employee-actions">
                    <button
                        className="employee-secondary-btn"
                        onClick={handleExport}
                    >
                        <Download size={17} />
                        Export
                    </button>

                    <button
                        className="employee-primary-btn"
                        onClick={openAddModal}
                    >
                        <UserPlus size={17} />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* EMPLOYEE SUMMARY */}
            <div className="employee-summary">
                <div className="employee-summary-icon">
                    <Users size={22} />
                </div>

                <div>
                    <small>Total Employees</small>
                    <strong>{employees.length}</strong>
                </div>

                <span className="employee-summary-note">
                    Workforce Overview
                </span>
            </div>

            {/* TOOLBAR */}
            <div className="employee-toolbar">

                {/* SEARCH */}
                <div className="employee-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* DEPARTMENT FILTER */}
                <div className="employee-filter">
                    <Filter size={17} />

                    <select
                        value={departmentFilter}
                        onChange={(e) => {
                            setDepartmentFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">All Departments</option>

                        {departments.map((department) => (
                            <option
                                key={department.id}
                                value={department.name}
                            >
                                {department.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* STATUS FILTER */}
                <div className="employee-filter">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* ERROR */}
            {error && !showModal && (
                <div className="employee-empty">
                    {error}
                </div>
            )}

            {/* DIRECTORY TABLE */}
            <div className="employee-directory-panel">

                <div className="employee-table-scroll">
                    <table className="directory-table">

                        <thead>
                            <tr>
                                <th>EMPLOYEE</th>
                                <th>DEPARTMENT</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((employee) => (
                                    <tr key={employee.id}>

                                        {/* EMPLOYEE */}
                                        <td>
                                            <div className="directory-person">

                                                <div className="directory-avatar">
                                                    {getInitials(employee.name)}
                                                </div>

                                                <div>
                                                    <strong
                                                        className="employee-name-link"
                                                        onClick={() =>
                                                            navigate(
                                                                `/employees/${employee.id}`
                                                            )
                                                        }
                                                        title="View Employee Profile"
                                                    >
                                                        {employee.name}
                                                    </strong>

                                                    <small>
                                                        {employee.email}
                                                    </small>
                                                </div>

                                            </div>
                                        </td>

                                        {/* DEPARTMENT */}
                                        <td>
                                            {employee.department || "—"}
                                        </td>

                                        {/* ROLE */}
                                        <td>
                                            {employee.role || "—"}
                                        </td>

                                        {/* STATUS */}
                                        <td>
                                            <span
                                                className={`directory-status ${employee.status === "Active"
                                                        ? "active"
                                                        : employee.status === "On Leave"
                                                            ? "leave"
                                                            : "inactive"
                                                    }`}
                                            >
                                                <span></span>
                                                {employee.status}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td>
                                            <div className="directory-actions">

                                                <button
                                                    title="Edit Employee"
                                                    onClick={() =>
                                                        openEditModal(employee)
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    title="Delete Employee"
                                                    onClick={() =>
                                                        handleDelete(employee.id)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="employee-empty"
                                    >
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                {/* FOOTER + PAGINATION */}
                <div className="employee-table-footer">

                    <div className="employee-footer-content">
                        Showing {startEmployee}–{endEmployee} of{" "}
                        {filteredEmployees.length} employees
                    </div>

                    <div className="employee-pagination">

                        <button
                            disabled={currentPage <= 1}
                            onClick={() =>
                                setCurrentPage((page) => page - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {currentPage} of {Math.max(totalPages, 1)}
                        </span>

                        <button
                            disabled={
                                currentPage >= totalPages ||
                                totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage((page) => page + 1)
                            }
                        >
                            Next
                        </button>

                    </div>
                </div>

            </div>

            {/* ADD / EDIT MODAL */}
            {showModal && (
                <div className="employee-modal-overlay">

                    <div className="employee-modal">

                        {/* MODAL HEADER */}
                        <div className="employee-modal-heading">
                            <div>
                                <h2>
                                    {editingId
                                        ? "Edit Employee"
                                        : "Add Employee"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update employee information"
                                        : "Enter employee information"}
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeModal}
                                type="button"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* FORM */}
                        <form onSubmit={handleSubmit}>

                            <label>
                                Full Name

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Email Address

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Department

                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Department
                                    </option>

                                    {departments.map((department) => (
                                        <option
                                            key={department.id}
                                            value={department.name}
                                        >
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Designation

                                <input
                                    type="text"
                                    name="role"
                                    placeholder="Enter designation"
                                    value={form.role}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Status

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </label>

                            {error && (
                                <div className="employee-empty">
                                    {error}
                                </div>
                            )}

                            {/* MODAL ACTIONS */}
                            <div className="employee-modal-actions">

                                <button
                                    type="button"
                                    className="employee-secondary-btn"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="employee-primary-btn"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Employee"
                                            : "Add Employee"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Employees;