
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Building2,
    Plus,
    Search,
    Pencil,
    Trash2,
    Users,
} from "lucide-react";

import "./Departments.css";

const API = "http://localhost:8080/api/departments";
const EMPLOYEE_API = "http://localhost:8080/api/employees";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            const response = await axios.get(API);
            setDepartments(response.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    // Fetch employees
    const fetchEmployees = async () => {
        try {
            const response = await axios.get(EMPLOYEE_API);
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // Load data on page open
    useEffect(() => {
        fetchDepartments();
        fetchEmployees();
    }, []);

    // Count employees department-wise
    const getEmployeeCount = (departmentName) => {
        return employees.filter(
            (employee) =>
                employee.department?.trim().toLowerCase() ===
                departmentName.trim().toLowerCase()
        ).length;
    };

    // Open Add Modal
    const openAddModal = () => {
        setEditingId(null);
        setName("");
        setDescription("");
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (department) => {
        setEditingId(department.id);
        setName(department.name);
        setDescription(department.description || "");
        setShowModal(true);
    };

    // Add / Update Department
    const handleSubmit = async (e) => {
        e.preventDefault();

        const department = {
            name: name.trim(),
            description: description.trim(),
        };

        try {
            if (editingId) {
                await axios.put(`${API}/${editingId}`, department);
            } else {
                await axios.post(API, department);
            }

            setShowModal(false);
            fetchDepartments();
        } catch (error) {
            alert(
                error.response?.status === 409
                    ? "Department already exists!"
                    : "Unable to save department."
            );
        }
    };

    // Delete Department
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) {
            return;
        }

        try {
            await axios.delete(`${API}/${id}`);
            fetchDepartments();
        } catch (error) {
            alert("Unable to delete department.");
        }
    };

    // Search Departments
    const filteredDepartments = departments.filter((department) =>
        department.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="departments-page">
            <div className="departments-heading">
                <div>
                    <h1>Departments</h1>
                    <p>Manage your organization's departments</p>
                </div>

                <button className="add-department-btn" onClick={openAddModal}>
                    <Plus size={18} />
                    Add Department
                </button>
            </div>

            <div className="department-toolbar">
                <div className="department-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <span className="department-count">
                    {departments.length} Departments
                </span>
            </div>

            <div className="department-grid">
                {filteredDepartments.map((department) => (
                    <div className="department-card" key={department.id}>
                        <div className="department-card-top">
                            <div className="department-icon">
                                <Building2 size={24} />
                            </div>

                            <div className="department-actions">
                                <button
                                    onClick={() => openEditModal(department)}
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    onClick={() => handleDelete(department.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3>{department.name}</h3>

                        <p className="department-description">
                            {department.description || "No description available"}
                        </p>

                        <div className="department-card-footer">
                            <Users size={16} />
                            <span>
                                {getEmployeeCount(department.name)} Employees
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDepartments.length === 0 && (
                <div className="department-empty">
                    <Building2 size={40} />
                    <h3>No departments found</h3>
                    <p>Create your first department to get started.</p>
                </div>
            )}

            {showModal && (
                <div className="department-modal-overlay">
                    <div className="department-modal">
                        <h2>{editingId ? "Edit Department" : "Add Department"}</h2>

                        <form onSubmit={handleSubmit}>
                            <label>Department Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Engineering"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <label>Description</label>
                            <textarea
                                placeholder="Enter department description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                            />

                            <div className="department-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button type="submit">
                                    {editingId ? "Update Department" : "Save Department"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Departments;
