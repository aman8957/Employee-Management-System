
package com.ems.employee;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

        private final EmployeeRepository employeeRepository;
        private final DepartmentRepository departmentRepository;
        private final EmployeeActivityService activityService;

        private final Path uploadDirectory = Paths.get("uploads/employees").toAbsolutePath().normalize();

        public EmployeeController(
                        EmployeeRepository employeeRepository,
                        DepartmentRepository departmentRepository,
                        EmployeeActivityService activityService) {

                this.employeeRepository = employeeRepository;
                this.departmentRepository = departmentRepository;
                this.activityService = activityService;
        }

        public record EmployeeResponse(
                        Long id,
                        String firstName,
                        String lastName,
                        String email,
                        String department,
                        String designation,
                        String status,
                        String profilePhoto) {
        }

        public record EmployeeRequest(
                        String firstName,
                        String lastName,
                        String email,
                        String department,
                        String designation,
                        String status) {
        }

        private EmployeeResponse toResponse(Employee employee) {
                return new EmployeeResponse(
                                employee.getId(),
                                employee.getFirstName(),
                                employee.getLastName(),
                                employee.getEmail(),
                                employee.getDepartment() != null
                                                ? employee.getDepartment().getName()
                                                : null,
                                employee.getDesignation(),
                                employee.getStatus(),
                                employee.getProfilePhoto());
        }

        private String getFullName(Employee employee) {
                return (employee.getFirstName() + " " +
                                (employee.getLastName() != null
                                                ? employee.getLastName()
                                                : ""))
                                .trim();
        }

        private Department findDepartment(String departmentName) {
                if (departmentName == null || departmentName.isBlank()) {
                        throw new IllegalArgumentException(
                                        "Department name is required");
                }

                return departmentRepository
                                .findByNameIgnoreCase(departmentName.trim())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Department not found: " + departmentName));
        }

        private void validateRequest(EmployeeRequest request) {
                if (request == null) {
                        throw new IllegalArgumentException(
                                        "Employee request cannot be empty");
                }

                if (request.firstName() == null ||
                                request.firstName().isBlank()) {
                        throw new IllegalArgumentException(
                                        "First name is required");
                }

                if (request.email() == null ||
                                request.email().isBlank()) {
                        throw new IllegalArgumentException(
                                        "Email is required");
                }

                if (request.designation() == null ||
                                request.designation().isBlank()) {
                        throw new IllegalArgumentException(
                                        "Designation is required");
                }

                if (request.status() == null ||
                                request.status().isBlank()) {
                        throw new IllegalArgumentException(
                                        "Status is required");
                }

                if (!List.of("Active", "Inactive", "On Leave")
                                .contains(request.status())) {
                        throw new IllegalArgumentException(
                                        "Invalid employee status");
                }
        }

        // GET All Employees
        @GetMapping
        public List<EmployeeResponse> getAllEmployees() {
                return employeeRepository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        // GET Employee by ID
        @GetMapping("/{id}")
        public ResponseEntity<EmployeeResponse> getEmployeeById(
                        @PathVariable Long id) {

                return employeeRepository.findById(id)
                                .map(employee -> ResponseEntity.ok(toResponse(employee)))
                                .orElse(ResponseEntity.notFound().build());
        }

        // CREATE Employee + Activity
        @PostMapping
        public EmployeeResponse createEmployee(
                        @RequestBody EmployeeRequest request) {

                validateRequest(request);

                Department department = findDepartment(request.department());

                Employee employee = new Employee();
                employee.setFirstName(request.firstName().trim());
                employee.setLastName(
                                request.lastName() != null
                                                ? request.lastName().trim()
                                                : "");
                employee.setEmail(request.email().trim());
                employee.setDepartment(department);
                employee.setDesignation(request.designation().trim());
                employee.setStatus(request.status());

                Employee savedEmployee = employeeRepository.save(employee);

                activityService.logActivity(
                                savedEmployee.getId(),
                                getFullName(savedEmployee),
                                "EMPLOYEE_CREATED",
                                "Employee profile created",
                                "Admin");

                return toResponse(savedEmployee);
        }

        // UPDATE Employee + Activity
        @PutMapping("/{id}")
        public ResponseEntity<EmployeeResponse> updateEmployee(
                        @PathVariable Long id,
                        @RequestBody EmployeeRequest request) {

                validateRequest(request);

                return employeeRepository.findById(id)
                                .map(employee -> {


                                        Department department = findDepartment(request.department());

                                        employee.setFirstName(request.firstName().trim());
                                        employee.setLastName(
                                                        request.lastName() != null
                                                                        ? request.lastName().trim()
                                                                        : "");
                                        employee.setEmail(request.email().trim());
                                        employee.setDepartment(department);
                                        employee.setDesignation(
                                                        request.designation().trim());
                                        employee.setStatus(request.status());

                                        Employee savedEmployee = employeeRepository.save(employee);

                                        activityService.logActivity(
                                                        savedEmployee.getId(),
                                                        getFullName(savedEmployee),
                                                        "EMPLOYEE_UPDATED",
                                                        "Employee profile information updated",
                                                        "Admin");

                                        return ResponseEntity.ok(
                                                        toResponse(savedEmployee));
                                })
                                .orElse(ResponseEntity.notFound().build());
        }

        // UPLOAD Employee Profile Photo + Activity
        @PostMapping("/{id}/photo")
        public ResponseEntity<EmployeeResponse> uploadProfilePhoto(
                        @PathVariable Long id,
                        @RequestParam("file") MultipartFile file)
                        throws IOException {

                Employee employee = employeeRepository.findById(id)
                                .orElse(null);

                if (employee == null) {
                        return ResponseEntity.notFound().build();
                }

                if (file.isEmpty()) {
                        return ResponseEntity.badRequest().build();
                }

                String contentType = file.getContentType();

                if (contentType == null ||
                                !List.of("image/jpeg", "image/png", "image/webp")
                                                .contains(contentType)) {
                        return ResponseEntity.badRequest().build();
                }

                if (file.getSize() > 5 * 1024 * 1024) {
                        return ResponseEntity.badRequest().build();
                }

                Files.createDirectories(uploadDirectory);

                String extension = switch (contentType) {
                        case "image/png" -> ".png";
                        case "image/webp" -> ".webp";
                        default -> ".jpg";
                };

                String filename = UUID.randomUUID() + extension;
                Path targetPath = uploadDirectory.resolve(filename);

                Files.copy(
                                file.getInputStream(),
                                targetPath,
                                StandardCopyOption.REPLACE_EXISTING);

                String oldPhoto = employee.getProfilePhoto();

                if (oldPhoto != null && !oldPhoto.isBlank()) {
                        try {
                                Path oldPath = uploadDirectory.resolve(
                                                Paths.get(oldPhoto).getFileName().toString());
                                Files.deleteIfExists(oldPath);
                        } catch (Exception ignored) {
                        }
                }

                employee.setProfilePhoto("/uploads/employees/" + filename);

                Employee savedEmployee = employeeRepository.save(employee);

                activityService.logActivity(
                                savedEmployee.getId(),
                                getFullName(savedEmployee),
                                "PROFILE_PHOTO_UPLOADED",
                                "Employee profile photo uploaded",
                                "Admin");

                return ResponseEntity.ok(toResponse(savedEmployee));
        }

        // REMOVE Employee Profile Photo + Activity
        @DeleteMapping("/{id}/photo")
        public ResponseEntity<EmployeeResponse> removeProfilePhoto(
                        @PathVariable Long id) {

                Employee employee = employeeRepository.findById(id)
                                .orElse(null);

                if (employee == null) {
                        return ResponseEntity.notFound().build();
                }

                String photo = employee.getProfilePhoto();

                if (photo != null && !photo.isBlank()) {
                        try {
                                Path photoPath = uploadDirectory.resolve(
                                                Paths.get(photo).getFileName().toString());
                                Files.deleteIfExists(photoPath);
                        } catch (IOException ignored) {
                        }
                }

                employee.setProfilePhoto(null);

                Employee savedEmployee = employeeRepository.save(employee);

                activityService.logActivity(
                                savedEmployee.getId(),
                                getFullName(savedEmployee),
                                "PROFILE_PHOTO_REMOVED",
                                "Employee profile photo removed",
                                "Admin");

                return ResponseEntity.ok(toResponse(savedEmployee));
        }

        // DELETE Employee + Activity
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteEmployee(
                        @PathVariable Long id) {

                Employee employee = employeeRepository.findById(id)
                                .orElse(null);

                if (employee == null) {
                        return ResponseEntity.notFound().build();
                }

                String employeeName = getFullName(employee);

                // Delete employee photo
                deleteEmployeePhoto(employee);

                // Delete employee
                employeeRepository.delete(employee);

                // Save activity after deletion
                activityService.logActivity(
                                id,
                                employeeName,
                                "EMPLOYEE_DELETED",
                                "Employee " + employeeName + " deleted",
                                "Admin");

                return ResponseEntity.noContent().build();
        }

        // Delete Employee Photo
        private void deleteEmployeePhoto(Employee employee) {

                String photo = employee.getProfilePhoto();

                if (photo != null && !photo.isBlank()) {
                        try {
                                Path photoPath = uploadDirectory.resolve(
                                                Paths.get(photo).getFileName().toString());

                                Files.deleteIfExists(photoPath);
                        } catch (IOException ignored) {
                        }
                }
        }
}
