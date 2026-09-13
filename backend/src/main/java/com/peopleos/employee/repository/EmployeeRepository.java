package com.peopleos.employee.repository;

import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.entity.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByEmployeeCodeAndIdNot(String employeeCode, Long id);

    long countByStatus(EmployeeStatus status);

    long countByJoinedDateAfter(LocalDate date);

    @Query("select e.department, count(e) from Employee e group by e.department")
    List<Object[]> countByDepartment();

}
