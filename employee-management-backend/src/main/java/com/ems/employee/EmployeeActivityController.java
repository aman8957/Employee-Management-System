
package com.ems.employee;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeActivityController {

    private final EmployeeActivityService activityService;

    public EmployeeActivityController(
            EmployeeActivityService activityService) {
        this.activityService = activityService;
    }

    // GET ACTIVITIES OF ONE EMPLOYEE
    @GetMapping("/employee/{employeeId}")
    public List<EmployeeActivity> getEmployeeActivities(
            @PathVariable Long employeeId) {

        return activityService.getEmployeeActivities(employeeId);
    }

    // GET ALL ACTIVITIES
    @GetMapping
    public List<EmployeeActivity> getAllActivities() {
        return activityService.getAllActivities();
    }
}
