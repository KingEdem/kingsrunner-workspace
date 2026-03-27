package com.institution.kingsrunner.config;

import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.Department;
import com.institution.kingsrunner.entity.Institution;
import com.institution.kingsrunner.entity.Role;
import com.institution.kingsrunner.entity.Sector;
import com.institution.kingsrunner.entity.Worker;
import com.institution.kingsrunner.repository.AppUserRepository;
import com.institution.kingsrunner.repository.DepartmentRepository;
import com.institution.kingsrunner.repository.InstitutionRepository;
import com.institution.kingsrunner.repository.WorkerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.logging.Logger;

@Configuration
public class DatabaseSeeder {

    private static final Logger logger = Logger.getLogger(DatabaseSeeder.class.getName());

    @Bean
    public CommandLineRunner seedDatabase(InstitutionRepository institutionRepository,
                                          DepartmentRepository departmentRepository,
                                          WorkerRepository workerRepository,
                                          AppUserRepository appUserRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            if (workerRepository.count() == 0) {

                // Step 1: Create and save the root Institution
                Institution kingsrunner = new Institution();
                kingsrunner.setName("Kingsrunner Global");
                kingsrunner.setSector(Sector.TECH);
                Institution savedInstitution = institutionRepository.save(kingsrunner);

                // Step 2: Create and save the System Administration department, linked to the Institution
                Department systemAdmin = new Department();
                systemAdmin.setName("System Administration");
                systemAdmin.setDescription("Core ERP Management");
                systemAdmin.setInstitution(savedInstitution);
                Department savedDepartment = departmentRepository.save(systemAdmin);

                // Step 3: Create the Super Admin worker, linked to the Department
                Worker superAdmin = new Worker();
                superAdmin.setFullName("Novor Prince Edem Kofi");
                superAdmin.setEmail("admin@kingsrunner.tech");
                superAdmin.setJobTitle("Super Admin");
                superAdmin.setDepartment(savedDepartment);
                workerRepository.save(superAdmin);

                logger.info("SYSTEM ALERT: Default Super Admin Profile Created for Novor Prince Edem Kofi.");
                System.out.println("SYSTEM ALERT: Default Super Admin Profile Created for Novor Prince Edem Kofi.");
            }

            // Seed the Super Admin AppUser account (auth credentials)
            appUserRepository.findByEmail("novor@kingsrunner.tech").ifPresentOrElse(
                    existing -> logger.info("Super Admin AppUser already exists — skipping."),
                    () -> {
                        AppUser superAdminUser = new AppUser();
                        superAdminUser.setFullName("Novor Prince Edem Kofi");
                        superAdminUser.setEmail("novor@kingsrunner.tech");
                        superAdminUser.setPassword(passwordEncoder.encode("Admin@123"));
                        superAdminUser.setRole(Role.SUPER_ADMIN);
                        superAdminUser.setInstitution(null);
                        appUserRepository.save(superAdminUser);
                        System.out.println("\uD83D\uDC51 Absolute Authority Granted: Novor Prince Edem Kofi (novor@kingsrunner.tech)");
                    }
            );

            // Seed the Test Worker AppUser account
            appUserRepository.findByEmail("eric@kingsrunner.tech").ifPresentOrElse(
                    existing -> logger.info("Test Worker AppUser already exists — skipping."),
                    () -> {
                        AppUser workerUser = new AppUser();
                        workerUser.setFullName("Eric");
                        workerUser.setEmail("eric@kingsrunner.tech");
                        workerUser.setPassword(passwordEncoder.encode("Worker@123"));
                        workerUser.setRole(Role.WORKER);
                        workerUser.setInstitution(null);
                        appUserRepository.save(workerUser);
                        System.out.println("\uD83D\uDC77 Test Worker Account Created: eric@kingsrunner.tech");
                    }
            );
        };
    }
}
