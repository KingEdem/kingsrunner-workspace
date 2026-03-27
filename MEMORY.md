# MEMORY.md — Persistent Hard-Won Rules & Lessons

> This file acts as persistent AI memory for the Kingsrunner ERP project. Organized by topic, not chronologically. Update this whenever a new lesson is confirmed through debugging or production incidents.

---

## 1. Environment & Infrastructure

- **RULE — XAMPP Tomcat:** Never run XAMPP's Tomcat server while developing the Spring Boot backend. Spring Boot uses its own embedded Tomcat on **Port 8080**. Running XAMPP's Tomcat simultaneously causes an `Address already in use` port conflict, resulting in an **Exit Code 1** crash on `mvnw spring-boot:run`.

- **RULE — MySQL Corruption Recovery:** If MySQL throws `Communications link failure` or `shutdown unexpectedly` in XAMPP despite showing a green "Running" status, it is a corrupted temporary data issue (not a config problem). Fix procedure:
  1. Rename `xampp/mysql/data` → `data_old`
  2. Copy the `backup` folder → rename it to `data`
  3. Move the specific `kingsrunner_db` folder from `data_old` into the new `data` folder
  4. Overwrite `ibdata1` in the new `data` folder with `ibdata1` from `data_old`
  5. Restart MySQL from XAMPP

- **RULE — Maven Wrapper:** Always use `.\mvnw spring-boot:run` from the project root (`kingsrunner/`). Do not use a system-installed Maven if versions differ.

---

## 2. AI Integration & Parsing (GeminiAiService)

- **RULE — Raw Output Only:** The Gemini AI Parser (`GeminiAiService.java`) must be prompted to output **raw terminal commands without markdown formatting, bullet prefixes, or conversational filler**. Any decorators in the output will break the frontend command dispatcher.

- **RULE — Fallback for Conversational Input:** The Gemini system prompt MUST include a fallback rule for when the user asks a conversational question (e.g., *"what does this do?"*) rather than issuing a command. The required output format is:
  ```
  INFO: [Explanation text here]
  ```

- **RULE — Frontend INFO Intercept:** The React frontend command dispatcher (`super-admin-view.tsx`) MUST intercept any AI response that begins with `INFO:` and render it as informational text (styled `text-blue-400`) instead of attempting to parse and execute it as a backend API fetch.

---

## 3. Database & JPA Architecture

- **RULE — Absolute Tenant Isolation:** `AppUser` MUST link to `Institution` via a `@ManyToOne` relationship. All data queries (Workers, Departments, Modules) MUST be scoped by `institutionId`. Returning global `findAll()` to non-SUPER_ADMIN users is a critical security violation.

- **RULE — LazyInitializationException:** Beware of Hibernate `LazyInitializationException` when accessing institution data through a user's security context **outside of an active `@Transactional` session**. The `AppUser` loaded by `UserDetailsService` into the `SecurityContextHolder` is a detached entity — calling `.getInstitution().getId()` on a `LAZY` fetch after the session closes will throw this exception.
  - **Fix options:** Use a custom DTO projection or write a `@Query` with `JOIN FETCH`. **Avoid `FetchType.EAGER`** as a quick fix, as it causes severe N+1 query performance degradation in enterprise architectures.

- **RULE — Worker ↔ Institution Join Path:** `Worker` has no direct `institution_id` column. It links through `Department`. Spring Data derived query names must traverse: `findByDepartmentInstitutionId(Long institutionId)`.

- **RULE — Seeder Guard:** The `DatabaseSeeder` uses `ifPresentOrElse()` on `Optional` from `findByEmail()` to prevent re-seeding on restart. Never use `count() == 0` alone for user-seed guards — it's too broad.

## 4. Spring Security & JWT

- **RULE — Circular Dependency:** Defining `UserDetailsService`, `DaoAuthenticationProvider`, `PasswordEncoder`, and `AuthenticationManager` beans **inside `SecurityConfig`** causes a circular dependency with `JwtAuthenticationFilter` (which needs `UserDetailsService`). Solution: Extract all identity/auth beans into a separate `ApplicationConfig.java`.

- **RULE — DaoAuthenticationProvider Constructor (Spring Security 6.x+):** The `setUserDetailsService()` setter was removed. Use the constructor: `new DaoAuthenticationProvider(userDetailsService())`.

- **RULE — JWT Principal Cast:** `JwtAuthenticationFilter` sets the full `AppUser` object (loaded by `UserDetailsService`) as the `Authentication` principal. Controllers can safely cast: `(AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal()`.

- **RULE — JJWT 0.12.x API:** The API changed significantly from 0.11.x. Correct 0.12.x usage:
  - `Jwts.parser()` (not `parserBuilder()`)
  - `.verifyWith(SecretKey)` (not `setSigningKey()`)
  - `.parseSignedClaims(token)` (not `parseClaimsJws()`)
  - `.getPayload()` (not `getBody()`)
  - `.subject()` / `.issuedAt()` (not `.setSubject()` / `.setIssuedAt()`)

- **RULE — CORS & PATCH Requests:** By default, Spring Boot's global CORS configuration only allows `GET`, `POST`, `PUT`, and `DELETE`. It completely blocks `PATCH` requests. When the frontend attempts a `PATCH` and hits this block, the browser throws a hard network error (`status: 0` / "Unable to reach server") instead of a standard 404 or 403. **Always explicitly include `"PATCH"` in the `.allowedMethods()` of your `CorsConfiguration`.**

- **RULE — CORS Wildcard Headers + Credentials = Browser Rejection:** Setting `allowedHeaders("*")` combined with `allowCredentials(true)` violates the CORS specification. Browsers strictly reject `OPTIONS` preflights that respond with both `Access-Control-Allow-Headers: *` and `Access-Control-Allow-Credentials: true`. This produces a silent 403 or preflight failure. **Always use an explicit allow-list:** `"Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"`. Apply this to both the `CorsConfigurationSource` bean and the `WebMvcConfigurer`.

- **RULE — JwtAuthenticationFilter Must Catch JWT Exceptions:** `jwtService.extractUsername(token)` and `jwtService.isTokenValid(token, userDetails)` can throw `io.jsonwebtoken.ExpiredJwtException`, `MalformedJwtException`, `SignatureException`, and others. If `doFilterInternal` does not wrap these in `try-catch`, an unhandled exception propagates out of the filter chain. Spring Security's `ExceptionTranslationFilter` catches it and converts it to a **403 Forbidden**, even on paths marked `permitAll()` in `SecurityConfig`. **Always wrap both JWT calls in `try-catch(Exception e)` in the filter, and `filterChain.doFilter()` in the catch block** to let the chain continue unauthenticated instead of throwing.

---

## 5. Multi-Tenancy Architecture

- **RULE — Sector Enum Storage:** Always use `@Enumerated(EnumType.STRING)` on enum fields. Storing ordinals (the default) is fragile — any reordering of enum values corrupts historical data.

- **RULE — Institution hierarchy:** Data ownership flows strictly top-down:
  ```
  Institution → Department (institution_id FK) → Worker (department_id FK)
  ```
  A `Worker` belongs to an `Institution` only transitively through its `Department`.
