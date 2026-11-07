
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Briefcase,
    UserRound,
    Pencil,
    Trash2,
    Camera,
    Clock,
    Copy,
    Check,
    Mail,
    X,
    Activity,
} from "lucide-react";

import "./EmployeeDetails.css";

const API_URL = "http://localhost:8080/api/employees";
const ACTIVITY_URL = "http://localhost:8080/api/activities";
const SERVER_URL = "http://localhost:8080";

export default function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const photoInputRef = useRef(null);

    const [employee, setEmployee] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState("");
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [removingPhoto, setRemovingPhoto] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // FETCH EMPLOYEE
    const fetchEmployee = async () => {
        try {
            setLoading(true);
            setError("");

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

    // FETCH REAL ACTIVITY
    const fetchActivities = async () => {
        try {
            setActivityLoading(true);
            setActivityError("");

            const response = await fetch(
                `${ACTIVITY_URL}/employee/${id}`
            );

            if (!response.ok) {
                throw new Error("Unable to load activity history");
            }

            const data = await response.json();

            // Latest activity first
            const sortedActivities = [...data].sort(
                (a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
            );

            setActivities(sortedActivities);
        } catch (err) {
            setActivityError(err.message);
        } finally {
            setActivityLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployee();
        fetchActivities();
    }, [id]);

    // ESCAPE KEY FOR PHOTO PREVIEW
    useEffect(() => {
        if (!previewOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setPreviewOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [previewOpen]);

    // UPLOAD PROFILE PHOTO
    const handlePhotoUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, PNG and WEBP images are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB.");
            event.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploadingPhoto(true);

            const response = await fetch(`${API_URL}/${id}/photo`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Photo upload failed");
            }

            const data = await response.json();

            setEmployee((prev) => ({
                ...prev,
                ...data,
                name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            }));

            await fetchActivities();

            alert("Profile photo uploaded successfully!");
        } catch (err) {
            alert(err.message);
        } finally {
            setUploadingPhoto(false);

            if (photoInputRef.current) {
                photoInputRef.current.value = "";
            }
        }
    };

    // REMOVE PROFILE PHOTO
    const handleRemovePhoto = async () => {
        if (!employee?.profilePhoto) return;

        const confirmed = window.confirm(
            "Are you sure you want to remove this profile photo?"
        );

        if (!confirmed) return;

        try {
            setRemovingPhoto(true);

            const response = await fetch(`${API_URL}/${id}/photo`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to remove profile photo");
            }

            setEmployee((prev) => ({
                ...prev,
                profilePhoto: null,
            }));

            setPreviewOpen(false);

            await fetchActivities();

            alert("Profile photo removed successfully!");
        } catch (err) {
            alert(err.message);
        } finally {
            setRemovingPhoto(false);
        }
    };

    // COPY EMPLOYEE ID
    const handleCopyEmployeeId = async () => {
        const employeeId = `EMP-${String(employee.id).padStart(4, "0")}`;

        try {
            await navigator.clipboard.writeText(employeeId);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            alert("Unable to copy Employee ID.");
        }
    };

    // DELETE EMPLOYEE
    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${employee.name}?`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete employee");
            }

            alert("Employee deleted successfully!");
            navigate("/employees");
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // ACTIVITY ICON
    const getActivityIcon = (action = "") => {
        const normalizedAction = action.toUpperCase();

        if (normalizedAction.includes("CREAT")) {
            return <UserRound size={16} />;
        }

        if (normalizedAction.includes("UPDAT")) {
            return <Pencil size={16} />;
        }

        if (normalizedAction.includes("PHOTO") ||
            normalizedAction.includes("UPLOAD") ||
            normalizedAction.includes("REMOV")) {
            return <Camera size={16} />;
        }

        if (normalizedAction.includes("DELET")) {
            return <Trash2 size={16} />;
        }

        return <Activity size={16} />;
    };

    // ACTIVITY TITLE
    const getActivityTitle = (action = "") => {
        const normalizedAction = action.toUpperCase();

        if (normalizedAction.includes("CREAT")) {
            return "Employee Created";
        }

        if (normalizedAction.includes("UPDAT")) {
            return "Employee Updated";
        }

        if (normalizedAction.includes("UPLOAD") ||
            normalizedAction.includes("PHOTO")) {
            return "Profile Photo";
        }

        if (normalizedAction.includes("REMOV")) {
            return "Profile Photo Removed";
        }

        if (normalizedAction.includes("DELET")) {
            return "Employee Deleted";
        }

        return action || "Employee Activity";
    };

    // FORMAT DATE
    const formatActivityDate = (dateValue) => {
        if (!dateValue) return "Date unavailable";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="employee-details-page">
                Loading employee...
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="employee-details-page">
                <button
                    className="employee-back-btn"
                    onClick={() => navigate("/employees")}
                >
                    <ArrowLeft size={16} />
                    Back to Employees
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

    const photoUrl = employee.profilePhoto
        ? `${SERVER_URL}${employee.profilePhoto}`
        : null;

    const formattedEmployeeId =
        `EMP-${String(employee.id).padStart(4, "0")}`;

    return (
        <div className="employee-details-page">

            {/* BACK BUTTON */}
            <button
                className="employee-back-btn"
                onClick={() => navigate("/employees")}
            >
                <ArrowLeft size={17} />
                Back to Employees
            </button>

            {/* PROFILE HEADER */}
            <div className="employee-profile-header">
                <div className="employee-profile-main">

                    {/* PROFILE PHOTO */}
                    <div className="employee-photo-wrapper">
                        <div className="employee-profile-avatar">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={`${employee.name} profile`}
                                    className="employee-profile-photo"
                                    onClick={() => setPreviewOpen(true)}
                                    title="Click to preview photo"
                                />
                            ) : (
                                initials
                            )}
                        </div>

                        <button
                            type="button"
                            className="employee-photo-upload-btn"
                            onClick={() => photoInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            title="Upload profile photo"
                        >
                            <Camera size={16} />
                        </button>

                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={handlePhotoUpload}
                        />
                    </div>

                    <div className="employee-profile-info">
                        <h1>{employee.name}</h1>
                        <p>{employee.designation || "Employee"}</p>

                        <span
                            className={`employee-profile-status ${employee.status?.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                            {employee.status}
                        </span>

                        {uploadingPhoto && (
                            <p className="employee-photo-message">
                                Uploading photo...
                            </p>
                        )}
                    </div>
                </div>

                {/* PROFILE ACTIONS */}
                <div className="employee-profile-actions">
                    {employee.profilePhoto && (
                        <button
                            type="button"
                            className="employee-photo-remove-btn"
                            onClick={handleRemovePhoto}
                            disabled={removingPhoto}
                        >
                            <Trash2 size={16} />
                            {removingPhoto ? "Removing..." : "Remove Photo"}
                        </button>
                    )}

                    <button
                        type="button"
                        className="employee-profile-edit-btn"
                        onClick={() => navigate(`/employees?edit=${employee.id}`)}
                    >
                        <Pencil size={16} />
                        Edit Employee
                    </button>

                    <button
                        type="button"
                        className="employee-profile-delete-btn"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        <Trash2 size={16} />
                        {deleting ? "Deleting..." : "Delete Employee"}
                    </button>
                </div>
            </div>

            {/* PROFILE INFORMATION */}
            <div className="employee-profile-grid">

                {/* PERSONAL INFORMATION */}
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
                        <a
                            href={`mailto:${employee.email}`}
                            className="employee-email-link"
                        >
                            <Mail size={15} />
                            {employee.email}
                        </a>
                    </div>

                    <div className="profile-detail">
                        <span>Employee ID</span>
                        <div className="employee-id-copy">
                            <strong>{formattedEmployeeId}</strong>

                            <button
                                type="button"
                                onClick={handleCopyEmployeeId}
                                title="Copy Employee ID"
                            >
                                {copied ? (
                                    <>
                                        <Check size={14} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* EMPLOYMENT INFORMATION */}
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

            {/* REAL EMPLOYEE ACTIVITY TIMELINE */}
            <div className="employee-activity-card">
                <div className="profile-card-heading">
                    <Clock size={19} />
                    <h3>Employee Activity</h3>
                    <span className="activity-count">
                        {activities.length}
                    </span>
                </div>

                <div className="employee-activity-timeline">

                    {activityLoading ? (
                        <div className="activity-empty-state">
                            Loading activity history...
                        </div>
                    ) : activityError ? (
                        <div className="activity-empty-state activity-error">
                            {activityError}
                            <button onClick={fetchActivities}>
                                Retry
                            </button>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="activity-empty-state">
                            <Clock size={24} />
                            <strong>No activity yet</strong>
                            <p>Employee activity will appear here.</p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div className="activity-item" key={activity.id}>
                                <div className="activity-icon activity-updated">
                                    {getActivityIcon(activity.action)}
                                </div>

                                <div className="activity-content">
                                    <strong>
                                        {getActivityTitle(activity.action)}
                                    </strong>

                                    <p>
                                        {activity.description ||
                                            "Employee activity recorded."}
                                    </p>

                                    <span className="activity-date">
                                        {formatActivityDate(activity.createdAt)}
                                    </span>

                                    {activity.performedBy && (
                                        <span className="activity-performed-by">
                                            By {activity.performedBy}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                </div>
            </div>

            {/* FULL SCREEN PHOTO PREVIEW */}
            {previewOpen && photoUrl && (
                <div
                    className="employee-photo-preview-overlay"
                    onClick={() => setPreviewOpen(false)}
                >
                    <button
                        type="button"
                        className="employee-photo-preview-close"
                        onClick={() => setPreviewOpen(false)}
                        aria-label="Close photo preview"
                    >
                        <X size={24} />
                    </button>

                    <img
                        src={photoUrl}
                        alt={`${employee.name} full profile`}
                        className="employee-photo-preview-image"
                        onClick={(event) => event.stopPropagation()}
                    />

                    <div className="employee-photo-preview-name">
                        {employee.name}
                    </div>
                </div>
            )}

        </div>
    );
}
