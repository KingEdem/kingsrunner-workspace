# PROMPT_LOG.md — Architectural Prompt Audit Trail

> This file logs major architectural prompts and AI generation instructions chronologically. Its purpose is to track feature evolution, debug regressions by understanding what was generated and when, and provide a human-readable history of all significant AI-assisted development decisions.

**Logging format:**
```
## [DATE] — [FEATURE_AREA]: [Short Title]
**Prompt Summary:** What was asked.
**Output:** What was generated / what files were created or modified.
**Notes:** Any caveats, follow-ups, or known issues introduced.
```

---

## [March 1, 2026] — ENTITIES: Department & Worker JPA Entities

**Prompt Summary:** Generate `Department` and `Worker` JPA entities with a bidirectional `@OneToMany` / `@ManyToOne` relationship. No Lombok. `@JsonIgnore` on the Department's worker list.

**Output:** Created `entity/Department.java`, `entity/Worker.java`.

**Notes:** `FetchType.LAZY` set on `@ManyToOne`. `cascade = ALL, orphanRemoval = true` on `@OneToMany`.

---

## [March 1, 2026] — CONFIG: Database Connection (application.properties)

**Prompt Summary:** Configure MySQL datasource, Hibernate DDL-auto, and SQL logging.

**Output:** Updated `src/main/resources/application.properties` with `ddl-auto=update`, `show-sql=true`, `format_sql=true`.

---

## [March 2, 2026] — REPOSITORIES & CONTROLLERS: Full CRUD for Department & Worker

**Prompt Summary:** Create `DepartmentRepository`, `WorkerRepository`, `DepartmentController`, `WorkerController` with POST and GET endpoints. Constructor injection, no Lombok.

**Output:** Created 4 files in `repository/` and `controller/`.

---

## [March 2, 2026] — CONFIG: DatabaseSeeder (Super Admin Profile)

**Prompt Summary:** Create a `CommandLineRunner` seeder that checks if the DB is empty and seeds the root Institution, System Administration Department, and Super Admin Worker.

**Output:** Created `config/DatabaseSeeder.java`.

---

## [March 2, 2026] — CONTROLLERS: PUT & DELETE Endpoints

**Prompt Summary:** Add PUT (update) and DELETE endpoints to both controllers with `findById` existence checks.

**Output:** Updated `DepartmentController.java`, `WorkerController.java`.

---

## [March 2, 2026] — ENTITIES: Institution + Sector Enum (Multi-Tenant Layer)

**Prompt Summary:** Introduce `Institution` entity and `Sector` enum. Add `@ManyToOne Institution` to `Department`. Update seeder.

**Output:** Created `entity/Institution.java`, `entity/Sector.java`, `repository/InstitutionRepository.java`, `controller/InstitutionController.java`. Updated `Department.java` and `DatabaseSeeder.java`.

---

## [March 2, 2026] — SERVICE: GeminiAiService (Phase 3 — AI Integration)

**Prompt Summary:** Create AI service using Gemini 2.5 Flash via `RestTemplate`. Generate an onboarding plan when a new worker is hired. Trigger from `WorkerController` POST.

**Output:** Created `service/GeminiAiService.java`. Updated `WorkerController.java` and `application.properties` (added `gemini.api.key`).

---

## [March 3, 2026] — DEPENDENCIES: Spring Security + JJWT

**Prompt Summary:** Add `spring-boot-starter-security`, `spring-boot-starter-validation`, and JJWT 0.12.6 dependencies. Create foundational `SecurityConfig` (permit all `/api/**`, stateless, BCrypt).

**Output:** Updated `pom.xml`. Created `config/SecurityConfig.java`.

---

## [March 3, 2026] — ENTITIES: AppUser + Role Enum

**Prompt Summary:** Create `AppUser` entity implementing `UserDetails`. Fields: id, email, password, role (enum), institution (nullable ManyToOne). Role enum: `SUPER_ADMIN`, `INSTITUTION_ADMIN`, `WORKER`.

**Output:** Created `entity/AppUser.java`, `entity/Role.java`.

---

## [March 3, 2026] — SERVICE: JwtService (JJWT 0.12.x)

**Prompt Summary:** Create JWT utility service: `generateToken()`, `extractUsername()`, `isTokenValid()`. Base64 secret key via `@Value`.

**Output:** Created `service/JwtService.java`. Added `jwt.secret.key` to `application.properties`.

---

## [March 3, 2026] — SEEDER: Super Admin AppUser Seed

**Prompt Summary:** Add `fullName` to `AppUser`. Create `AppUserRepository`. Update `DatabaseSeeder` to seed `novor@kingsrunner.tech` as `SUPER_ADMIN` with BCrypt-encoded password.

**Output:** Updated `entity/AppUser.java`. Created `repository/AppUserRepository.java`. Updated `config/DatabaseSeeder.java`.

---

## [March 3, 2026] — AUTH: DTOs + AuthController + SecurityConfig DaoAuthenticationProvider

**Prompt Summary:** Create `AuthRequest`, `AuthResponse` DTOs. Create `AuthController` POST `/api/auth/login`. Update `SecurityConfig` to expose `AuthenticationManager` bean and wire `DaoAuthenticationProvider`.

**Output:** Created `dto/AuthRequest.java`, `dto/AuthResponse.java`, `controller/AuthController.java`. Updated `config/SecurityConfig.java`.

**Notes:** `DaoAuthenticationProvider` no-args constructor removed in Spring Security 6.x. Must use `new DaoAuthenticationProvider(userDetailsService())`.

---

## [March 3, 2026] — SECURITY: JwtAuthenticationFilter + API Lockdown

**Prompt Summary:** Create `JwtAuthenticationFilter` extending `OncePerRequestFilter`. Update `SecurityConfig`: permit only `/api/auth/**`, lock all other endpoints, register filter before `UsernamePasswordAuthenticationFilter`.

**Output:** Created `config/JwtAuthenticationFilter.java`. Updated `config/SecurityConfig.java`.

---

## [March 3, 2026] — REFACTOR: Circular Dependency Resolution → ApplicationConfig

**Prompt Summary:** Circular dependency between `SecurityConfig` and `JwtAuthenticationFilter` via `UserDetailsService`. Extract all identity beans to a new `ApplicationConfig`.

**Output:** Created `config/ApplicationConfig.java`. Cleaned `config/SecurityConfig.java`.

---

## [March 3, 2026] — SECURITY: @EnableMethodSecurity + @PreAuthorize Access Matrix

**Prompt Summary:** Enable method security. Apply `@PreAuthorize` on all endpoints across Institution, Department, and Worker controllers per the access matrix (GET=all roles, POST/PUT=admin+, DELETE=SUPER_ADMIN only).

**Output:** Updated `config/SecurityConfig.java`, `controller/InstitutionController.java`, `controller/DepartmentController.java`, `controller/WorkerController.java`.

---

## [March 3, 2026] — SEEDER: Test Worker Account (eric@kingsrunner.tech)

**Prompt Summary:** Seed a `WORKER` role AppUser for integration testing of `@PreAuthorize`.

**Output:** Updated `config/DatabaseSeeder.java`.

---

## [March 3-6, 2026] — MULTI-TENANCY: Cross-Tenant Data Isolation on GET Endpoints

**Prompt Summary:** Enforce tenant isolation on all `getAll` endpoints. SUPER_ADMIN gets `findAll()`. Other roles get data scoped to their `institutionId`. Null institution → 403.

**Output:** Updated `repository/WorkerRepository.java` (added `findByDepartmentInstitutionId`), `repository/DepartmentRepository.java` (added `findByInstitutionId`). Updated all three controllers.

---

## [March 6, 2026] — META: Elite AI Framework Files Created

**Prompt Summary:** Scan workspace and generate persistent memory/rules/audit files: `MEMORY.md`, `PROJECT_RULES.md`, `PROMPT_LOG.md`.

**Output:** Created this file and the two files above.

**Notes:** Discrepancy detected — `text-blue-400` AI info rendering specified in `MEMORY.md` rules but not yet implemented in `super-admin-view.tsx`. See `PROJECT_RULES.md` Section 5.2 for details.
