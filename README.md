# Mobile Programming — Admin Web

Web dashboard quản trị cho `Mobile-Programming-Backend`. Quản lý sản phẩm, đơn hàng, user, coupon, và xem doanh thu.

Repo: `https://github.com/levietkhanh189/Mobile-Programming-Admin`

## Stack

- **Vite 5** + **React 18** + **TypeScript 5**
- **React Router v6**
- **Axios** (JWT interceptor)
- **Recharts** (biểu đồ doanh thu)
- **react-hot-toast** (notifications)
- **lucide-react** (icon set)
- Plain CSS (không Tailwind)
- `serve` để host `dist/` tĩnh trên Railway

## Features

- Login admin (`POST /admin/auth/login`) với JWT persistence
- **Dashboard**: doanh thu today / week / month / total, biểu đồ daily revenue, top products
- **Products**: CRUD đầy đủ
- **Orders**: list, xem chi tiết, cập nhật status (emit Socket.IO đến mobile app)
- **Users**: list, xem chi tiết, đổi role (CUSTOMER / MANAGER / ADMIN)
- **Coupons**: CRUD + toggle active

## Local Dev

```bash
npm install
cp .env.example .env        # set VITE_API_URL
npm run dev                 # http://localhost:5173
```

`VITE_API_URL` mặc định trỏ tới Railway backend prod (`https://backend-production-9c18.up.railway.app/api`). Đổi sang `http://localhost:3000/api` khi chạy backend local.

## Build & Run (giống Railway)

```bash
npm run build               # tsc -b + vite build → dist/
npm start                   # serve -s dist -l tcp://0.0.0.0:${PORT:-3000}
```

## Project Structure

```
src/
├── api.ts                  # Axios instance + JWT interceptor + endpoint wrappers
├── auth.ts                 # Token storage + login helpers
├── app.tsx                 # Router + layout
├── main.tsx                # Entry point
├── pages/
│   ├── login.tsx
│   ├── dashboard.tsx       # Revenue + charts
│   ├── products.tsx        # CRUD
│   ├── orders.tsx          # List + status update
│   ├── users.tsx           # List + role change
│   └── coupons.tsx         # CRUD + toggle
├── components/             # Shared UI
├── utils/
└── styles.css
```

## Deploy — Railway

`nixpacks.toml` đã được cấu hình sẵn. Các bước:

1. Tạo service mới trong Railway project (cùng project với backend).
2. Link GitHub repo `Mobile-Programming-Admin`.
3. Set env var `VITE_API_URL` trỏ tới backend API (`https://<backend>.up.railway.app/api`).
4. Generate domain để lấy URL public.

Railway sẽ chạy `npm run build` → `npm start` (serve static từ `dist/`).

## Seed Admin đầu tiên

Chạy 1 lần sau khi backend deploy xong:

```bash
curl -X POST https://<backend>.up.railway.app/api/admin/auth/seed \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@shop.com","password":"Admin@123","secretKey":"<ADMIN_SEED_KEY>"}'
```

`<ADMIN_SEED_KEY>` đọc từ env `ADMIN_SEED_KEY` của backend.

## Related Projects

- Backend API → `../Mobile-Programming-Backend`
- Mobile app (customer) → `../Mobile-Programming-Frontend`
