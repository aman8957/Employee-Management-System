
package com.ems.employee;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeController(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    // Employee Response DTO
    public record EmployeeResponse(
            Long id,
            String firstName,
            String lastName,
            String email,
            String department,
            String designation,
            String status) {
    }

    // Employee Request DTO
    public record EmployeeRequest(
            String firstName,
            String lastName,
            String email,
            String department,
            String designation,
            String status) {
    }

    // Convert Employee Entity to Response DTO
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
                employee.getStatus());
    }

    // Find Department by Name
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

    // Validate Employee Request
    private void validateRequest(EmployeeRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Employee request cannot be empty");
        }

        if (request.firstName() == null
                || request.firstName().isBlank()) {
            throw new IllegalArgumentException(
                    "First name is required");
        }

        if (request.email() == null
                || request.email().isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required");
        }

        if (request.designation() == null
                || request.designation().isBlank()) {
            throw new IllegalArgumentException(
                    "Designation is required");
        }

        if (request.status() == null
                || request.status().isBlank()) {
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

    // POST Create Employee
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

        return toResponse(savedEmployee);
    }

    // PUT Update Employee
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeRequest request) {

        validateRequest(request);

        return employeeRepository.findById(id)
                .map(employee -> {

                    Department department = findDepartment(request.department());

                    employee.setFirstName(
                            request.firstName().trim());

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

                    return ResponseEntity.ok(
                            toResponse(savedEmployee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE Employee
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Long id) {

        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        employeeRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
