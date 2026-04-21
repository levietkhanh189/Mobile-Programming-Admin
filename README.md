# Mobile Programming — Admin Web

Web dashboard quản trị cho backend `Mobile-Programming-Backend`.

## Stack

- Vite + React 18 + TypeScript
- React Router v6
- Axios
- Plain CSS (không Tailwind)
- `serve` để host static trên Railway

## Features

- Login admin (`POST /admin/auth/login`)
- Dashboard doanh thu (today / week / month / total + top products)
- CRUD Products
- Quản lý Orders + update status (emit Socket.IO)
- Quản lý Users + đổi role
- CRUD Coupons + toggle active

## Local dev

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

API URL đọc từ `VITE_API_URL`. Mặc định trỏ tới Railway backend prod.

## Build & run (giống Railway)

```bash
npm run build
npm start              # PORT default 3000
```

## Deploy Railway

Đã có `nixpacks.toml`. Chỉ cần:
1. Tạo service mới trong Railway project (cùng project với backend).
2. Link repo GitHub `Mobile-Programming-Admin`.
3. Set env `VITE_API_URL` trỏ tới backend API (`https://<backend>.up.railway.app/api`).
4. Generate domain để lấy URL public.

## Seed admin đầu tiên

Chạy 1 lần với backend:
```bash
curl -X POST https://<backend>.up.railway.app/api/admin/auth/seed \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@shop.com","password":"Admin@123","secretKey":"<ADMIN_SEED_KEY>"}'
```
