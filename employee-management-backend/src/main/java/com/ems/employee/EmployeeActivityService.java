
package com.ems.employee;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeActivityService {

    private final EmployeeActivityRepository activityRepository;

    public EmployeeActivityService(
            EmployeeActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    // SAVE ACTIVITY
    public EmployeeActivity logActivity(
            Long employeeId,
            String employeeName,
            String action,
            String description,
            String performedBy) {

        EmployeeActivity activity = new EmployeeActivity();

        activity.setEmployeeId(employeeId);
        activity.setEmployeeName(employeeName);
        activity.setAction(action);
        activity.setDescription(description);
        activity.setPerformedBy(
                performedBy != null ? performedBy : "Admin");

        return activityRepository.save(activity);
    }

    // GET EMPLOYEE ACTIVITIES
    public List<EmployeeActivity> getEmployeeActivities(Long employeeId) {
        return activityRepository
                .findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    // GET ALL ACTIVITIES
    public List<EmployeeActivity> getAllActivities() {
        return activityRepository.findAll();
    }
}
