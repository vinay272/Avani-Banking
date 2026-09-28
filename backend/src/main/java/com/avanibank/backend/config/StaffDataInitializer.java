package com.avanibank.backend.config;

import com.avanibank.backend.entity.Employee;
import com.avanibank.backend.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class StaffDataInitializer {

    @Bean
    CommandLineRunner initializeStaff(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            boolean superAdminExists =
                    employeeRepository
                            .findByRoleOrderByCreatedAtDesc(
                                    "SUPER_ADMIN"
                            )
                            .stream()
                            .findAny()
                            .isPresent();

            if (superAdminExists) {

                System.out.println(
                        "SUPER_ADMIN already exists. Skipping initialization."
                );

                return;
            }

            Employee admin = new Employee();

            admin.setEmployeeCode("AVN-SA-001");
            admin.setFullName("Avani Bank Super Admin");
            admin.setEmail("superadmin@avanibank.com");

            admin.setPassword(
                    passwordEncoder.encode("Admin@12345")
            );

            admin.setRole("SUPER_ADMIN");
            admin.setBranchCode("HEAD-OFFICE");
            admin.setStatus("ACTIVE");

            employeeRepository.save(admin);

            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "INITIAL SUPER_ADMIN CREATED"
            );
            System.out.println(
                    "Email: superadmin@avanibank.com"
            );
            System.out.println(
                    "Password: Admin@12345"
            );
            System.out.println(
                    "=============================================="
            );
        };
    }
}