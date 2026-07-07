# Org Hub Backend (NestJS + Prisma + PostgreSQL)

Ye backend "Global Organization Architecture Hub" app ke liye hai — Super Admin login karega
aur Account Managers, Field Managers, Office Admins, Projects create/manage kar sakega.

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # DB models (SuperAdmin, AccountManager, FieldManager, OfficeAdmin, Project)
│   └── seed.ts             # First super admin bana dega
├── src/
│   ├── prisma/             # PrismaService + PrismaModule (global DB connection)
│   ├── auth/                # Login (JWT issue karta hai)
│   │   ├── dto/login.dto.ts
│   │   ├── guards/jwt-auth.guard.ts   # Isse protect hoti hain APIs
│   │   └── strategies/jwt.strategy.ts
│   ├── account-managers/    # CRUD APIs
│   ├── field-managers/      # CRUD APIs
│   ├── office-admins/       # CRUD APIs
│   ├── projects/            # CRUD APIs
│   ├── common/decorators/current-user.decorator.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
└── tsconfig.json
```

Har module ka pattern same hai: `xxx.module.ts` → `xxx.controller.ts` → `xxx.service.ts` → `dto/`.
Isse naye modules add karna easy rahega (jaise future me "documents" ya "sites" module).

## Setup Steps

1. **Install PostgreSQL** (locally ya Docker se):
   ```bash
   docker run --name org-hub-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=org_hub -p 5432:5432 -d postgres:16
   ```

2. **Env file bana lo**:
   ```bash
   cp .env.example .env
   # DATABASE_URL and JWT_SECRET check/update kar lena
   ```

3. **Dependencies install karo**:
   ```bash
   npm install
   ```

4. **Prisma se DB tables banao (migration)**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Pehla Super Admin seed karo**:
   ```bash
   npm run seed
   ```
   Isse `userName: superadmin` and `passcode: ChangeMe123!` wala admin ban jayega
   (production me isse turant password change kar dena).

6. **Server run karo**:
   ```bash
   npm run start:dev
   ```

Server chalega: `http://localhost:3000/api/v1`

## Testing kahan karni hai

- **Swagger UI (sabse asaan)**: `http://localhost:3000/api/docs`
  Yahan browser me hi har API try kar sakte ho. Pehle `/auth/login` call karo,
  jo `accessToken` milega usse top-right "Authorize" button me daal do — fir
  saari protected APIs test ho sakengi.

- **Postman**: Same base URL (`http://localhost:3000/api/v1`) use karo.
  Login se token lo, fir har request ke `Authorization` header me
  `Bearer <token>` daal do.

- **Prisma Studio** (DB visually dekhne ke liye):
  ```bash
  npx prisma studio
  ```

## API Overview

| Method | Endpoint | Auth Required | Kaam |
|---|---|---|---|
| POST | `/api/v1/auth/login` | No | Super admin login, JWT milega |
| POST/GET | `/api/v1/account-managers` | Yes | Create / list account managers |
| GET/PATCH/DELETE | `/api/v1/account-managers/:id` | Yes | Single record ops |
| POST/GET | `/api/v1/field-managers` | Yes | Same pattern |
| POST/GET | `/api/v1/office-admins` | Yes | Same pattern |
| POST/GET | `/api/v1/projects` | Yes | name + location |

Sabhi list/create/update/delete responses me **passcode kabhi return nahi hota** —
service layer me `sanitize()` se hata diya jata hai.

## Notes

- Passcode hamesha **bcrypt hash** hokar DB me store hota hai, plain text kabhi nahi.
- `ValidationPipe` global hai — koi bhi extra/unknown field bhejoge to request reject ho jayegi
  (`forbidNonWhitelisted: true`), isse APIs clean rehti hain.
- Frontend ke `personnel-create-form.tsx` ka schema (`fullName`, `userName`, `passcode` min 4)
  exactly `CreateAccountManagerDto` / `CreateFieldManagerDto` / `CreateOfficeAdminDto` se match karta hai.
# expense-backend
# expense-tracker-backend
