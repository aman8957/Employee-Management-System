
package com.ems.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeActivityRepository
        extends JpaRepository<EmployeeActivity, Long> {

    List<EmployeeActivity> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

}
