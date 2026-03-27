# PROJECT_RULES.md — Design & Architecture Bible

> The authoritative reference for all architectural decisions, tech stack requirements, design tokens, and coding conventions for the Kingsrunner ERP system. All contributors (human and AI) must adhere to these rules.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Spring Boot 4.x |
| **Language** | Java 25 |
| **Security** | Spring Security 6.x (Stateless JWT) |
| **Persistence** | Spring Data JPA + Hibernate |
| **Database** | MySQL (via XAMPP locally) |
| **AI Service** | Google Gemini API (`gemini-2.5-flash`) via `RestTemplate` |
| **Frontend Framework** | Next.js (App Router) |
| **UI Library** | React + Shadcn UI components |
| **Styling** | Tailwind CSS v4 |
| **Font** | Geist (sans) / Geist Mono (mono) — via `@theme inline` in `globals.css` |

---

## 2. Package Structure (Backend)

```
com.institution.kingsrunner
├── config/          # SecurityConfig, ApplicationConfig, JwtAuthenticationFilter, DatabaseSeeder
├── controller/      # REST controllers (Auth, Institution, Department, Worker)
├── dto/             # AuthRequest, AuthResponse
├── entity/          # JPA entities + enums (AppUser, Institution, Department, Worker, Role, Sector)
├── repository/      # Spring Data JPA interfaces
└── service/         # GeminiAiService, JwtService
```

---

## 3. API Design Rules

- **Base path:** All endpoints are prefixed `/api/`
- **Authentication exceptions:** Only `/api/auth/**` is publicly accessible (no JWT required)
- **All other endpoints** require a valid `Authorization: Bearer <token>` header
- **Role-based access** is enforced via `@PreAuthorize` method security (enabled by `@EnableMethodSecurity`):

| HTTP Method | Allowed Roles |
|---|---|
| `GET` (read all) | `SUPER_ADMIN`, `INSTITUTION_ADMIN`, `WORKER` |
| `POST` / `PUT` (create/update) | `SUPER_ADMIN`, `INSTITUTION_ADMIN` |
| `POST /api/institutions` | `SUPER_ADMIN` only |
| `DELETE` | `SUPER_ADMIN` only |

- **Tenant isolation** is enforced at the controller level: non-`SUPER_ADMIN` users only receive data scoped to their `institutionId`.

---

## 4. Entity Relationship Rules

- No Lombok. All entities use explicit no-args constructors, getters, and setters.
- Use `jakarta.persistence.*` (not `javax.persistence.*`).
- All enums stored as `@Enumerated(EnumType.STRING)`.
- Bidirectional `@OneToMany` / `@ManyToOne` relationships use `@JsonIgnore` on the collection side to prevent serialization cycles.
- Fetch type defaults: `@ManyToOne` uses `FetchType.LAZY` throughout.

---

## 5. Frontend Design System

> **Extracted directly from `components/super-admin-view.tsx` and `app/globals.css`** on March 6, 2026.

### 5.1 Root Layout

| Property | Value |
|---|---|
| Root wrapper | `flex h-screen bg-zinc-950 font-mono text-sm` |
| Global font | `font-mono` → Geist Mono |
| Sidebar width | `w-72` (288px), `flex-shrink-0` |
| Sidebar background | `bg-zinc-950` |
| Sidebar right border | `border-r border-zinc-800/60` |
| Main area | `flex flex-1 flex-col overflow-hidden` |
| All dividers / borders | `border-zinc-800/60` |

### 5.2 Terminal Output Color Tokens

> These are the exact Tailwind classes applied per log entry `type` in the `logs.map()` render block.

| Log Type | Tailwind Class | Purpose |
|---|---|---|
| `input` (user command) | `text-emerald-300` | User-typed commands echoed to terminal |
| `success` (OK response) | `text-emerald-400` | Successful operation confirmations |
| `output` (preformatted) | `text-cyan-300/80` | ASCII tables and structured data |
| `error` | `text-red-400` | Error messages / failed operations |
| `info` (general) | `text-zinc-500` | System messages, status lines |
| `ai` (conversational) | `text-blue-400` | Explanations and conversational fallback from the Gemini AI |

> **Note on AI Interception:** The frontend `runCommand` function explicitly checks if a raw string starts with `INFO:`. If it does, the dispatcher intercepts it, strips the prefix, and pushes it to the terminal state as type `"ai"`, which triggers the `text-blue-400` styling.

### 5.3 CLI Input Bar

| Element | Class |
|---|---|
| Container | `bg-zinc-950 px-4 py-3` |
| Prompt prefix text | `text-zinc-600` (`"institution-runner"`) |
| Prompt chevron icon | `text-emerald-500` |
| Input text | `text-emerald-300` |
| Input caret | `caret-emerald-400` |
| Input placeholder | `placeholder:text-zinc-700` |

### 5.4 Sidebar Elements

| Element | Class |
|---|---|
| Command code tiles | `bg-zinc-900 text-emerald-400/70 rounded px-2 py-1.5 text-[11px]` |
| Section heading | `text-zinc-400 uppercase tracking-wider text-xs font-semibold` |
| Section icon | `text-zinc-600 h-3.5 w-3.5` |
| Stats footer area | `border-t border-zinc-800/60 px-4 py-3` |
| Stat box | `rounded border border-zinc-800/60 bg-zinc-900/50 py-1.5` |
| Stat value | `text-emerald-400 text-base font-bold` |
| Stat label | `text-zinc-600 text-[10px] tracking-wider` |

### 5.5 Status Indicators & Badges

| Element | Class |
|---|---|
| Active session dot | `bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] h-2 w-2 rounded-full` |
| Session status text | `text-emerald-500/70` |
| Role label | `text-zinc-500` |
| Pending request badge | `border border-amber-800/30 bg-amber-900/20 text-amber-400` |
| Destructive badge | `border border-red-800/30 bg-red-900/20 text-red-400` |
| Neutral badge | `bg-zinc-800 text-zinc-500` |

### 5.6 Selection Panel

| Element | Class |
|---|---|
| Panel container | `bg-zinc-900/70 border-t border-emerald-900/40 px-4 py-3` |
| Selected item | `bg-emerald-900/30 text-emerald-300` |
| Unselected item | `text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300` |
| Navigation hint text | `text-zinc-500 text-[11px]` |

### 5.7 CSS Custom Properties (from `globals.css`)

| Variable | Value | Approximate Color |
|---|---|---|
| `--background` | `oklch(0.1 0 0)` | Near-black |
| `--card` | `oklch(0.13 0 0)` | Very dark grey |
| `--sidebar` | `oklch(0.12 0 0)` | Very dark grey |
| `--primary` | `oklch(0.75 0.18 155)` | Emerald green |
| `--accent` | `oklch(0.7 0.15 200)` | Cyan/teal |
| `--destructive` | `oklch(0.55 0.22 27)` | Red-orange |
| `--border` | `oklch(0.25 0 0)` | Dark grey |
| `--muted-foreground` | `oklch(0.6 0 0)` | Mid grey |

---

## 6. Coding Conventions

- **No Lombok** anywhere in the backend.
- **Constructor injection** only (no `@Autowired` field injection).
- `ResponseEntity` wraps all controller return types for explicit HTTP status control.
- `Optional.ifPresentOrElse()` preferred for "create if not exists" guards.
- `@Transactional` must be applied to any service method that accesses lazy-loaded relations outside of a request-scoped JPA session.
