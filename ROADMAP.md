# Vehicle Repair Shop Management System — Development Roadmap

**Role:** Staff-Level System Architect  
**Stack:** MongoDB · Express.js · React · Node.js (MERN)  
**Principle:** Outside-in, dependency-ordered, micro-tasks with a verification checkpoint after every step.  
**Rule:** This document describes *what* to build — not *how*. Implementation details come only after roadmap approval.

---

## How to Use This Roadmap

1. Complete milestones in order. Do not skip ahead.
2. Within a milestone, complete tasks in numeric order.
3. After every micro-task, run its **Verification Step** before starting the next task.
4. A milestone is “done” only when its **Milestone Exit Criteria** all pass.
5. Ask for approval before starting coding on any milestone.

---

## System Context (Architecture Snapshot)

| Layer | Responsibility |
|--------|----------------|
| React Client | Role-based UIs for Customer, Staff/Mechanic, Branch Manager, Super Admin |
| Express API | Auth, RBAC, bookings, inventory, payroll, payments, feedback |
| MongoDB | Users, branches, vehicles, services, bookings, inventory, payroll, payments, feedback |
| External | Stripe (checkout & webhooks) |

**Dependency chain (never reverse):** Schema → Seed/fixtures → API → Role guards → UI screens → End-to-end flows.

---

## Milestone Map

| # | Milestone | Depends On |
|---|-----------|------------|
| 0 | Monorepo & Tooling Scaffold | — |
| 1 | Database Connection & Core Schemas | 0 |
| 2 | Auth & RBAC API | 1 |
| 3 | Auth & Shell UI | 2 |
| 4 | Branch / Regional Store API | 2 |
| 5 | Branch / Regional Store UI | 3, 4 |
| 6 | Staff Management API | 4 |
| 7 | Staff Management UI | 5, 6 |
| 8 | Service Catalog & Booking API | 4, 6 |
| 9 | Service Catalog & Booking UI | 7, 8 |
| 10 | Repair Workflow / Status API | 8 |
| 11 | Repair Workflow / Status UI | 9, 10 |
| 12 | Inventory Management API | 4 |
| 13 | Inventory Management UI | 5, 12 |
| 14 | Online Payment & Invoice API | 10 |
| 15 | Online Payment & Invoice UI | 11, 14 |
| 16 | Salary / Payroll API | 6, 10 |
| 17 | Salary / Payroll UI | 7, 16 |
| 18 | Customer Feedback API | 10, 14 |
| 19 | Customer Feedback UI | 11, 15, 18 |
| 20 | Role Dashboards & Cross-Cutting Polish | 5–19 |
| 21 | End-to-End Hardening & Deployment Readiness | 20 |

---

# Milestone 0 — Monorepo & Tooling Scaffold

**Goal:** Empty but runnable backend and frontend shells with shared env conventions.

### Task 0.1 — Create repository folder layout
Define top-level folders for `server`, `client`, and shared docs; ensure `.gitignore` covers `node_modules`, env files, and build output.  
**Verification:** Open the project root and confirm `server/`, `client/`, `PRD.md`, `ROADMAP.md`, and `.cursorrules` exist; `git status` shows no secrets tracked.

### Task 0.2 — Initialize Node backend package
Create the Express server package with a minimal `package.json` and a single health-check entry file that starts without crashing.  
**Verification:** From `server/`, start the process and confirm the terminal shows the server listening on the configured port.

### Task 0.3 — Add Express health endpoint
Expose a `GET /api/health` route that returns a simple JSON success payload.  
**Verification:** Call `GET /api/health` (browser or HTTP client) and confirm HTTP 200 with an OK-style body.

### Task 0.4 — Configure CORS and JSON body parsing
Enable CORS for the future React origin and JSON request parsing middleware.  
**Verification:** Send a JSON POST to a temporary echo/test route (or health with OPTIONS) and confirm CORS headers appear and JSON bodies are accepted without errors.

### Task 0.5 — Environment configuration skeleton
Add an example env file listing required keys (Mongo URI, JWT secret, Stripe keys, client URL, port) without real secrets.  
**Verification:** Confirm `.env.example` exists, `.env` is gitignored, and the server reads port/host from env (or safe defaults).

### Task 0.6 — Initialize React frontend package
Create the React app package with a blank root page that renders a static title (e.g., app name).  
**Verification:** Start the client; browser shows the static title with no console module errors.

### Task 0.7 — Frontend API base URL config
Add a single place for the API base URL (env-driven) pointed at the local Express server.  
**Verification:** Log or display the configured base URL on a temporary debug line and confirm it matches the server origin.

### Task 0.8 — Client health ping
Add a one-button or auto-fetch call from React to `GET /api/health` and display the result.  
**Verification:** With both apps running, reload the client and confirm the health response text appears on screen.

### Milestone 0 Exit Criteria
- [x] Server and client start independently  
- [x] Health check works from HTTP client and from React  
- [x] Env example documented; secrets not committed  

---

# Milestone 1 — Database Connection & Core Schemas

**Goal:** MongoDB connected; all primary collections modeled; seedable empty structure. No business APIs yet beyond optional schema smoke checks.

### Task 1.1 — Connect Express to MongoDB
Wire the server startup to establish a MongoDB connection and fail loudly if the URI is missing/invalid.  
**Verification:** Start the server with a valid URI; logs show “connected.” Start with a bad URI; process errors clearly without hanging silently.

### Task 1.2 — Define User schema
Model users with email/password hash fields, role enum (Customer, Staff, BranchManager, SuperAdmin), profile fields, optional branch reference, and timestamps.  
**Verification:** In a Mongo shell/GUI or a one-off seed script, insert one user document and confirm required fields and role enum reject invalid roles.

### Task 1.3 — Define Branch (Store) schema
Model branches with name, region, address, contact info, active flag, and timestamps.  
**Verification:** Insert one branch; query by region returns it; inactive flag can be set and read.

### Task 1.4 — Define Vehicle schema
Model vehicles owned by a customer: make, model, year, plate/VIN, customer reference.  
**Verification:** Insert a vehicle linked to a customer id; query by customer returns it.

### Task 1.5 — Define ServiceType catalog schema
Model bookable service types: name, description, base price, estimated duration, active flag.  
**Verification:** Insert two service types; list query returns both; inactive ones can be filtered out.

### Task 1.6 — Define Booking / Appointment schema
Model bookings with customer, vehicle, branch, service type(s), scheduled slot, status enum (e.g., Pending, Confirmed, InProgress, Completed, Cancelled), assigned staff optional, notes.  
**Verification:** Insert a booking linking customer/vehicle/branch/service; status defaults correctly; invalid status rejected.

### Task 1.7 — Define RepairJob / WorkOrder schema (or extend Booking)
Ensure there is a clear record for mechanic work: linked booking, status history, parts used placeholders, labor notes.  
**Verification:** Create a work order from a booking id; status history array accepts at least one status change entry.

### Task 1.8 — Define InventoryItem schema
Model parts with SKU, name, quantity, reorder threshold, unit cost, branch reference.  
**Verification:** Insert items for two branches; query by branch returns only that branch’s stock.

### Task 1.9 — Define Attendance schema
Model staff attendance: staff user, branch, clock-in, clock-out, date.  
**Verification:** Insert one attendance row; query by staff and date returns it.

### Task 1.10 — Define Payroll / Payslip schema
Model payslips: staff, period start/end, hours or commission inputs, calculated amount, status (Draft/Approved/Paid), branch/region refs as needed.  
**Verification:** Insert a draft payslip; amount and period fields persist; status enum enforced.

### Task 1.11 — Define Payment & Invoice schemas
Model payments (amount, currency, Stripe ids, status, booking/invoice refs) and invoices (line items, totals, customer, booking, PDF/url placeholder).  
**Verification:** Insert linked invoice + payment; query by booking returns both.

### Task 1.12 — Define Feedback schema
Model ratings/reviews: customer, booking, branch, optional staff, score, comment, timestamps.  
**Verification:** Insert feedback tied to a completed booking concept; query by branch returns it.

### Task 1.13 — Index plan for high-traffic queries
Document and add indexes for email uniqueness, branch+region filters, booking slot/branch, inventory SKU+branch, low-stock threshold queries.  
**Verification:** Confirm unique email rejects duplicates; explain-plan or index list shows the new indexes exist.

### Task 1.14 — Dev seed script (minimal fixture set)
Create a repeatable seed that inserts: 1 Super Admin, 1 Branch Manager, 1 Staff, 1 Customer, 2 Branches in different regions, sample service types.  
**Verification:** Wipe/re-run seed; counts match expected; login credentials for seed users are documented in a local-only note (not committed secrets).

### Milestone 1 Exit Criteria
- [ ] All core schemas exist and validate  
- [ ] Multi-branch inventory and bookings can be represented  
- [ ] Seed script produces a known baseline dataset  

---

# Milestone 2 — Auth & RBAC API

**Goal:** Register/login/logout (or token invalidate), JWT (or session) auth, role middleware. No feature UIs yet.

### Task 2.1 — Password hashing utility
Ensure passwords are never stored plaintext; hashing/verification helpers exist.  
**Verification:** Hash a known password; verify succeeds for correct password and fails for wrong password.

### Task 2.2 — Register Customer endpoint
`POST` register for Customer role only (public). Validate email uniqueness and required fields.  
**Verification:** Register a new customer → 201; duplicate email → 409/400; password field not returned in response.

### Task 2.3 — Login endpoint
`POST` login returns access token (and optionally refresh strategy later) plus safe user profile.  
**Verification:** Login with seed user → token + role; bad password → 401; disabled/missing user → 401.

### Task 2.4 — Auth middleware (protect routes)
Middleware that rejects missing/invalid tokens and attaches `req.user`.  
**Verification:** Call a protected `/api/me` with no token → 401; with valid token → 200 and correct user id/role.

### Task 2.5 — Role-guard middleware
Guards for Staff, BranchManager, SuperAdmin (and combinations).  
**Verification:** Customer token hitting a SuperAdmin-only route → 403; SuperAdmin → 200.

### Task 2.6 — Get current user profile endpoint
`GET /api/me` returns profile including role and branch assignment if any.  
**Verification:** Login as Branch Manager; `/api/me` shows branch id; Customer shows no staff branch.

### Task 2.7 — Super Admin create staff/manager users endpoint
Allow Super Admin (and later Branch Manager within branch) to create Staff/BranchManager accounts.  
**Verification:** Super Admin creates Staff assigned to Branch A → 201; Customer token cannot create staff → 403.

### Task 2.8 — Change password / basic account update (optional but recommended)
Authenticated user can update own profile fields and password with current-password check.  
**Verification:** Update name succeeds; wrong current password for change fails; email uniqueness still enforced.

### Task 2.9 — Auth API smoke checklist document
List every auth endpoint, roles allowed, and sample requests for Postman/Insomnia.  
**Verification:** Walk the checklist once; all rows pass.

### Milestone 2 Exit Criteria
- [ ] Register, login, `/me`, role guards work  
- [ ] Seed Super Admin can create staff users  
- [ ] No plaintext passwords in DB  

---

# Milestone 3 — Auth & Shell UI

**Goal:** Customer/staff can register/login; app shell routes by role; unauthorized users redirected.

### Task 3.1 — App routing skeleton
Define public routes (login/register) and protected route wrapper.  
**Verification:** Visit a protected path logged out → redirect to login.

### Task 3.2 — Auth context / session store
Client stores token and user after login; clears on logout; persists across refresh as designed.  
**Verification:** Login → refresh page → still authenticated; logout → token gone.

### Task 3.3 — Login page UI
Form posts to login API; shows errors; on success navigates by role.  
**Verification:** Wrong password shows error; correct seed customer lands on customer home stub.

### Task 3.4 — Customer registration page UI
Form posts to register API; then auto-login or redirect to login.  
**Verification:** New email registers and can subsequently log in.

### Task 3.5 — Role-based landing stubs
Four stub home pages: Customer, Staff, Branch Manager, Super Admin (empty content, distinct titles).  
**Verification:** Login as each seed role → correct stub title; cannot manually navigate to another role’s home (guarded).

### Task 3.6 — App shell / nav by role
Top or side nav shows only links allowed for that role.  
**Verification:** Customer nav has no “Payroll”; Super Admin nav includes regional admin links (stubs OK).

### Task 3.7 — Logout control
Visible logout clears session and returns to login.  
**Verification:** After logout, back-button to protected page still blocked.

### Milestone 3 Exit Criteria
- [ ] Full login/register/logout loop works in the browser  
- [ ] Role redirects and nav restrictions verified for all four roles  

---

# Milestone 4 — Branch / Regional Store API

**Goal:** CRUD and filtering for branches by region; Super Admin–centric, Branch Manager read of own branch.

### Task 4.1 — Create branch endpoint (Super Admin)
**Verification:** Super Admin creates Branch B in Region West → 201; Staff → 403.

### Task 4.2 — List branches with region filter
**Verification:** Seed two regions; filter `?region=` returns only matching branches.

### Task 4.3 — Get branch by id
**Verification:** Valid id → 200; unknown id → 404.

### Task 4.4 — Update branch (Super Admin)
**Verification:** Rename/deactivate branch; GET reflects change.

### Task 4.5 — Branch access helper
Centralize “user may access this branch data” rules (Super Admin all; Manager own; Staff own; Customer booking-related later).  
**Verification:** Unit/manual checks: Manager of A cannot GET internal ops for Branch B (prepare for later modules).

### Task 4.6 — Soft-deactivate vs hard-delete policy
Implement deactivate; avoid hard-delete if bookings exist (or block delete).  
**Verification:** Deactivated branch excluded from “active branches” list used by booking later; attempt delete when constrained returns clear error.

### Milestone 4 Exit Criteria
- [ ] Super Admin can manage branches and filter by region  
- [ ] Branch-scoped access helper ready for later modules  

---

# Milestone 5 — Branch / Regional Store UI

**Goal:** Super Admin manages stores; others see appropriate read-only context.

### Task 5.1 — Super Admin branch list page
Table/list of branches with region filter control.  
**Verification:** Filter changes visible rows to match API.

### Task 5.2 — Create / edit branch form
**Verification:** Create then edit; list updates without manual DB edits.

### Task 5.3 — Branch detail view
Show address, region, active status.  
**Verification:** Open each seed branch; fields match seed data.

### Task 5.4 — Branch Manager “my branch” view
Read-only summary of assigned branch.  
**Verification:** Manager of A sees A only; no create-branch controls.

### Milestone 5 Exit Criteria
- [ ] Super Admin full branch CRUD UI works  
- [ ] Manager scoped view verified  

---

# Milestone 6 — Staff Management API

**Goal:** Employee profiles, assignment to branch, task assignment hooks, attendance APIs.

### Task 6.1 — List staff with branch/region filters
Super Admin: all; Manager: own branch.  
**Verification:** Manager lists only Branch A staff; Super Admin can filter by region.

### Task 6.2 — Get / update staff profile
Update phone, skills, active flag; Manager limited to own branch.  
**Verification:** Manager updates A staff OK; updating B staff → 403.

### Task 6.3 — Assign / reassign staff to branch (Super Admin)
**Verification:** Move staff from A to B; subsequent lists reflect assignment.

### Task 6.4 — Task assignment endpoint
Assign a booking/work order to a staff user (validates same branch).  
**Verification:** Assign Branch A job to Branch A mechanic → OK; cross-branch assign → 400/403.

### Task 6.5 — Attendance clock-in endpoint
**Verification:** Staff clocks in → attendance row created; double clock-in without clock-out rejected or handled per rules.

### Task 6.6 — Attendance clock-out endpoint
**Verification:** Clock-out sets end time; duration computable.

### Task 6.7 — Attendance report query (Manager / Super Admin)
Filter by staff, branch, date range.  
**Verification:** Seed two days of attendance; date filter returns expected count.

### Milestone 6 Exit Criteria
- [ ] Branch-scoped staff CRUD/list works  
- [ ] Assignment and attendance APIs verified  

---

# Milestone 7 — Staff Management UI

**Goal:** Managers and Super Admin manage people; staff can clock in/out.

### Task 7.1 — Staff directory page (role-scoped)
**Verification:** Manager vs Super Admin see different scopes matching API.

### Task 7.2 — Staff profile edit form
**Verification:** Edit and reload shows saved values.

### Task 7.3 — Assign staff to branch UI (Super Admin)
**Verification:** Reassign in UI; directory filter confirms move.

### Task 7.4 — Assign mechanic to job UI (Manager)
From a booking/work order stub list, pick staff.  
**Verification:** Assignment appears on job detail; wrong-branch staff not selectable.

### Task 7.5 — Staff attendance clock UI
Simple clock-in/out on staff home.  
**Verification:** Clock in → status “on shift”; clock out → shift closed; Manager report page shows the entry.

### Task 7.6 — Attendance report page (Manager / Super Admin)
**Verification:** Date range filter matches known seed punches.

### Milestone 7 Exit Criteria
- [ ] Staff directory, assignment, and attendance usable in browser for all relevant roles  

---

# Milestone 8 — Service Catalog & Booking API

**Goal:** Customers book services at a branch for a time slot; availability rules enforced.

### Task 8.1 — Service type CRUD (Super Admin / Manager policy)
Decide who manages catalog; implement list (public/auth) and admin create/update.  
**Verification:** Active services listable; inactive hidden from customer-facing list.

### Task 8.2 — Customer vehicle CRUD
Customer creates/lists/updates own vehicles only.  
**Verification:** Customer A cannot read Customer B’s vehicles.

### Task 8.3 — Availability / slot generation rules
Define slot length from service duration; expose available slots for branch+date+service.  
**Verification:** Book one slot; that slot no longer appears as available (or capacity decrements as designed).

### Task 8.4 — Create booking endpoint
Customer books: branch, vehicle, service(s), slot. Status starts Pending/Confirmed per rules.  
**Verification:** Valid booking → 201; overlapping slot conflict → 409; missing vehicle ownership → 403.

### Task 8.5 — List bookings (role-scoped)
Customer: own; Staff: assigned; Manager: branch; Super Admin: all + filters.  
**Verification:** Each role sees only allowed bookings.

### Task 8.6 — Cancel / reschedule booking (rules)
Customer cancel before cutoff; Manager override.  
**Verification:** Cancel frees slot; late cancel blocked if rule says so.

### Task 8.7 — Booking status read model for tracking
Endpoint returning current status + timeline for customer tracking.  
**Verification:** After manual status tweak in DB/API, customer tracking payload updates.

### Milestone 8 Exit Criteria
- [ ] Catalog + vehicles + slot booking + scoped lists all pass conflict tests  

---

# Milestone 9 — Service Catalog & Booking UI

**Goal:** Customer can complete a booking flow; staff/admin can see queues.

### Task 9.1 — Service catalog browse page
**Verification:** Only active services shown with price/duration.

### Task 9.2 — Customer vehicle manager page
**Verification:** Add two vehicles; list shows both; delete/deactivate one.

### Task 9.3 — Booking wizard (branch → service → vehicle → slot)
**Verification:** Complete wizard; booking appears in “My Bookings.”

### Task 9.4 — My Bookings list + detail + cancel
**Verification:** Cancel from UI removes/changes status and frees slot in next booking attempt.

### Task 9.5 — Branch booking queue (Manager / Staff)
**Verification:** New customer booking shows in branch queue without refresh issues (manual refresh OK).

### Task 9.6 — Super Admin cross-branch booking filter
**Verification:** Filter by region/branch returns correct subset.

### Milestone 9 Exit Criteria
- [ ] Full customer booking path works against live API  
- [ ] Role-scoped queues verified  

---

# Milestone 10 — Repair Workflow / Status API

**Goal:** Mechanics update repair status; history recorded; customers can track.

### Task 10.1 — Start work order from confirmed booking
**Verification:** Starting creates/links work order; booking status moves to InProgress.

### Task 10.2 — Update status endpoint (Staff assigned or Manager)
Allowed transitions only (e.g., InProgress → WaitingParts → Completed).  
**Verification:** Illegal transition → 400; legal → history entry appended.

### Task 10.3 — Add labor notes / checklist updates
**Verification:** Notes persist and appear on GET work order.

### Task 10.4 — Record parts used (link to inventory deduction later or stub)
Accept parts lines on work order; optionally call inventory service in Milestone 12.  
**Verification:** Parts lines saved on work order even if inventory not yet decremented.

### Task 10.5 — Complete repair endpoint
Marks Completed; unlocks payment eligibility flag.  
**Verification:** Incomplete jobs cannot be marked payable; completed ones can.

### Task 10.6 — Customer tracking endpoint (public-to-customer)
Returns sanitized status timeline.  
**Verification:** Customer sees statuses; internal staff-only notes hidden if required.

### Milestone 10 Exit Criteria
- [ ] Status machine + history + completion gate for payments verified  

---

# Milestone 11 — Repair Workflow / Status UI

**Goal:** Staff update jobs; customers track progress.

### Task 11.1 — Staff “My Jobs” board
**Verification:** Assigned jobs listed; unassigned not shown to that mechanic.

### Task 11.2 — Job detail + status transition controls
**Verification:** Click allowed next status; timeline updates; illegal button not shown or errors clearly.

### Task 11.3 — Labor notes form
**Verification:** Save notes; reload shows them.

### Task 11.4 — Customer repair tracking page
**Verification:** As statuses change in staff UI, customer tracking page reflects them after refresh.

### Task 11.5 — Manager branch jobs overview
**Verification:** All branch jobs visible; can reassign (reuse Milestone 7 assignment UI).

### Milestone 11 Exit Criteria
- [ ] Staff and customer status loops work end-to-end in UI  

---

# Milestone 12 — Inventory Management API

**Goal:** Branch-specific stock, low-stock alerts, adjustments.

### Task 12.1 — Create inventory item (Manager / Super Admin)
**Verification:** Item created under Manager’s branch automatically; Super Admin can choose branch.

### Task 12.2 — List inventory by branch + search
**Verification:** Branch A list excludes Branch B SKUs.

### Task 12.3 — Adjust stock (receive / consume)
**Verification:** Receive +10 → quantity 10; consume beyond stock → rejected.

### Task 12.4 — Low-stock alert query
Items where quantity ≤ reorder threshold.  
**Verification:** Set threshold and quantity to trigger; alert list includes item; raising stock removes it.

### Task 12.5 — Deduct parts on work order completion (integration)
When parts are used on a job, decrement branch inventory atomically as designed.  
**Verification:** Complete job with Part X qty 2 → inventory decreases by 2; insufficient stock blocks completion or warns per policy.

### Task 12.6 — Cross-branch inventory read (Super Admin only)
**Verification:** Super Admin regional filter works; Manager cannot read other branches.

### Milestone 12 Exit Criteria
- [ ] Branch inventory CRUD, alerts, and job deduction path verified  

---

# Milestone 13 — Inventory Management UI

**Goal:** Managers operate stock; Super Admin oversight; alerts visible.

### Task 13.1 — Inventory list page with low-stock badge
**Verification:** Low-stock items visually flagged matching API alert list.

### Task 13.2 — Add / edit item form
**Verification:** Create and edit; list updates.

### Task 13.3 — Stock adjust controls
**Verification:** Receive/consume from UI changes quantity correctly.

### Task 13.4 — Super Admin multi-branch inventory view
**Verification:** Region/branch filters work.

### Task 13.5 — Job parts usage UI linked to inventory
**Verification:** Selecting a part on a job and completing updates stock on inventory page.

### Milestone 13 Exit Criteria
- [ ] Manager can run daily stock ops entirely from UI  

---

# Milestone 14 — Online Payment & Invoice API

**Goal:** Secure Stripe checkout for completed services; invoices persisted.

### Task 14.1 — Invoice generation from completed work order
Build line items from services + parts; compute totals/tax policy stub.  
**Verification:** Completing a job allows invoice create; amounts match expected line sum.

### Task 14.2 — Get invoice by id (customer-owned or admin)
**Verification:** Owner can fetch; other customer → 403.

### Task 14.3 — Create Stripe Checkout Session (or PaymentIntent) endpoint
Only for unpaid invoices on completed jobs.  
**Verification:** API returns a checkout URL/client secret; unpaid-only rule enforced.

### Task 14.4 — Stripe webhook handler
Update payment + invoice status on success/failure; verify webhook signature.  
**Verification:** Using Stripe CLI/test events, successful pay → invoice Paid; invalid signature → rejected.

### Task 14.5 — Payment history endpoints (customer / admin)
**Verification:** Customer sees own payments; Super Admin can filter by branch/region.

### Task 14.6 — Idempotency / double-pay guard
**Verification:** Second checkout on already-paid invoice rejected.

### Milestone 14 Exit Criteria
- [ ] Test-mode Stripe pay flow updates DB via webhook  
- [ ] Invoices and payments queryable and scoped  

---

# Milestone 15 — Online Payment & Invoice UI

**Goal:** Customer pays; all roles can view appropriate financial records.

### Task 15.1 — Customer invoices list + detail
**Verification:** After job completion + invoice gen, customer sees unpaid invoice.

### Task 15.2 — Pay now button → Stripe Checkout
**Verification:** Test card payment completes; returning to app shows Paid (may need refresh/webhook wait).

### Task 15.3 — Payment success / cancel return pages
**Verification:** Success and cancel URLs render correct messaging.

### Task 15.4 — Manager / Super Admin invoice browser
**Verification:** Filters by branch/region; paid/unpaid tabs work.

### Milestone 15 Exit Criteria
- [ ] Customer can pay a completed job in test mode end-to-end  

---

# Milestone 16 — Salary / Payroll API

**Goal:** Calculate payroll from role, hours, and/or commission; manage payslips.

### Task 16.1 — Payroll policy config per role (or per staff)
Define inputs: hourly rate, salary, commission rules tied to completed paid jobs if applicable.  
**Verification:** Saving rates for a staff member persists and reads back.

### Task 16.2 — Gather payroll inputs for a period
Aggregate attendance hours and optional commission base for date range.  
**Verification:** Known attendance hours produce expected hour total.

### Task 16.3 — Calculate draft payslip endpoint
Manager (branch) / Super Admin (all) generates draft.  
**Verification:** Draft amount matches formula for fixture data; status Draft.

### Task 16.4 — Approve payslip
**Verification:** Draft → Approved; non-approver → 403.

### Task 16.5 — Mark payslip Paid + list/filter
**Verification:** Super Admin processes system-wide list; Manager limited to branch; filters by period work.

### Task 16.6 — Staff self-view payslips (read-only)
**Verification:** Staff sees own slips only.

### Milestone 16 Exit Criteria
- [ ] Draft → Approve → Paid lifecycle works with correct scoping  

---

# Milestone 17 — Salary / Payroll UI

**Goal:** Managers/Super Admin run payroll; staff view payslips.

### Task 17.1 — Compensation settings form (authorized roles)
**Verification:** Save rates; reload shows values.

### Task 17.2 — Generate draft payslips for period UI
**Verification:** Selecting a date range creates visible drafts with expected amounts.

### Task 17.3 — Approve / mark paid actions
**Verification:** Status badges update through the lifecycle.

### Task 17.4 — Staff “My Payslips” page
**Verification:** Staff sees only own history; PDF/link placeholder OK if no real PDF yet.

### Task 17.5 — Super Admin cross-branch payroll dashboard
**Verification:** Region filter changes totals/lists correctly.

### Milestone 17 Exit Criteria
- [ ] Payroll operable from UI for Manager and Super Admin; staff read path works  

---

# Milestone 18 — Customer Feedback API

**Goal:** Post-service ratings; aggregate for branch and staff performance.

### Task 18.1 — Submit feedback (customer, completed + preferably paid booking)
One feedback per booking.  
**Verification:** Eligible booking accepts rating; duplicate → 409; incomplete job → 400.

### Task 18.2 — List feedback by branch / staff (Manager / Super Admin)
**Verification:** Filters return only relevant reviews.

### Task 18.3 — Aggregate rating endpoints
Average score per branch and per staff.  
**Verification:** Two known ratings produce correct averages.

### Task 18.4 — Customer can view own past feedback
**Verification:** Own list only.

### Milestone 18 Exit Criteria
- [ ] Submit + list + aggregates verified with role scoping  

---

# Milestone 19 — Customer Feedback UI

**Goal:** Customers leave reviews; managers/admins monitor performance.

### Task 19.1 — “Rate your service” prompt on completed booking
**Verification:** Form only appears when eligible; submit succeeds.

### Task 19.2 — Customer feedback history
**Verification:** Submitted review listed.

### Task 19.3 — Branch performance panel (Manager)
**Verification:** Average rating and recent comments match API.

### Task 19.4 — Super Admin regional performance view
**Verification:** Compare two branches; rankings/averages match fixtures.

### Milestone 19 Exit Criteria
- [ ] Feedback loop complete in UI for customer and admin roles  

---

# Milestone 20 — Role Dashboards & Cross-Cutting Polish

**Goal:** Each role’s home is a useful dashboard; consistency, empty states, and basic UX polish.

### Task 20.1 — Customer dashboard
Upcoming bookings, active repairs, unpaid invoices, pending feedback.  
**Verification:** Seed a customer with one of each; all four widgets populate.

### Task 20.2 — Staff dashboard
Today’s assigned jobs, clock status, low-priority notices.  
**Verification:** Assign job + clock in; dashboard reflects both.

### Task 20.3 — Branch Manager dashboard
Today’s bookings, low-stock count, open jobs, attendance snapshot.  
**Verification:** Trigger low stock + open job; counts match list pages.

### Task 20.4 — Super Admin dashboard
Branch count by region, revenue snapshot (paid invoices), payroll pending, average ratings.  
**Verification:** Numbers match underlying filtered queries.

### Task 20.5 — Global error/empty/loading states
Standardize API error toasts and empty lists.  
**Verification:** Force 403/404/network error; UI shows readable message, no blank crash.

### Task 20.6 — Basic responsive check
Key flows usable on a narrow viewport.  
**Verification:** Login, book, and manager list usable at mobile width without broken layout.

### Milestone 20 Exit Criteria
- [ ] All four role homes show live data  
- [ ] No uncaught UI crashes on common error paths  

---

# Milestone 21 — End-to-End Hardening & Deployment Readiness

**Goal:** Prove full journeys; prepare for deploy without implementing production infra prematurely.

### Task 21.1 — E2E script: Customer happy path
Register → add vehicle → book → staff completes → pay → feedback.  
**Verification:** Entire path succeeds on a clean seed DB; checklist signed off.

### Task 21.2 — E2E script: Manager daily ops
Clock staff, assign job, adjust inventory, approve payslip draft.  
**Verification:** Checklist passes on Branch A without Super Admin rights.

### Task 21.3 — E2E script: Super Admin regional ops
Create branch, move staff, view cross-branch payments and ratings.  
**Verification:** Checklist passes across two regions.

### Task 21.4 — Security pass (checklist)
Confirm RBAC on every mutating route; webhook signature; env secrets; no sensitive fields in responses.  
**Verification:** Walk a written security checklist; fix any fails before marking done.

### Task 21.5 — README for local run
Document install, env vars, seed, Stripe test setup, and demo accounts.  
**Verification:** A fresh clone following README only can reach health + login.

### Task 21.6 — Production build smoke
Client production build serves; server starts with production env flags as designed.  
**Verification:** Build succeeds; health and login work against production build artifacts locally.

### Milestone 21 Exit Criteria
- [ ] Three E2E journeys pass  
- [ ] Security checklist and README complete  

---

## Suggested Implementation Cadence

| Cadence | Focus |
|---------|--------|
| One sitting | 1–3 micro-tasks (never skip verification) |
| One day | Usually one milestone slice (API *or* UI, not both unless tiny) |
| After each milestone | Demo the Exit Criteria before starting the next |

---

## Explicit Non-Goals (Until Roadmap Says Otherwise)

- Native mobile apps  
- Real-time sockets (polling/refresh is enough until Milestone 20+)  
- Advanced accounting/tax engines  
- Multi-currency beyond a single configured currency  
- AI diagnostics or parts recommendation  

---

## Approval Gate

**Status:** ⏳ Awaiting your approval  

Please review this roadmap and reply with one of:

1. **Approved** — begin coding at Milestone 0, Task 0.1  
2. **Approved with changes** — list edits (add/remove/reorder tasks)  
3. **Revise** — tell me what is wrong or missing  

No implementation work starts until you approve.
