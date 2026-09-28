package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    List<Employee> findByRoleOrderByCreatedAtDesc(String role);

    List<Employee> findByBranchCodeOrderByCreatedAtDesc(String branchCode);

    List<Employee> findByStatusOrderByCreatedAtDesc(String status);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);
}