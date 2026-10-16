# Auth API Smoke Checklist (Milestone 2)

Base URL: `http://localhost:5000`  
Auth header: `Authorization: Bearer <token>`

Seed users (password in `SEED_ACCOUNTS.local.md`):
- `admin@seed.local` — SuperAdmin
- `manager@seed.local` — BranchManager
- `staff@seed.local` — Staff
- `customer@seed.local` — Customer

---

## Endpoints

| # | Method | Path | Auth / roles | Expected |
|---|--------|------|--------------|----------|
| 1 | POST | `/api/auth/register` | Public (Customer only) | 201 + `user` (no password); duplicate → 409; missing fields → 400 |
| 2 | POST | `/api/auth/login` | Public | 200 + `token` + `user`; bad/missing → 401 |
| 3 | GET | `/api/me` | Any authenticated | 200 + profile (role, branch if any); no token → 401 |
| 4 | PATCH | `/api/me` | Any authenticated | Update name/phone/email; password needs `currentPassword`; wrong current → 401; duplicate email → 409 |
| 5 | POST | `/api/users` | SuperAdmin | Create Staff/BranchManager with branch → 201; Customer → 403 |
| 6 | GET | `/api/admin/ping` | SuperAdmin | `{ ok: true }`; Customer → 403; no token → 401 |

---

## Sample requests (PowerShell)

### 1. Register
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:5000/api/auth/register -ContentType "application/json" -Body '{"email":"smoke.customer@test.local","password":"TestPass123!","name":"Smoke Customer"}'

---

## Walk checklist

- [x] 1 Register
- [x] 2 Login
- [x] 3 GET /me
- [x] 4 PATCH /me
- [x] 5 POST /api/users (SuperAdmin)
- [x] 6 GET /api/admin/ping
- [x] Customer denied on 5 and 6 (403)

**Milestone 2 exit criteria**
- [x] Register, login, `/me`, role guards work
- [x] Seed Super Admin can create staff users
- [x] No plaintext passwords in DB (only hashes via `passwordHash`)