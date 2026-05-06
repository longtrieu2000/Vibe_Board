# 🎯 Vibe Board — Deployment Guide

Vibe Board là ứng dụng board tương tác hỗ trợ đa nền tảng (Web + Mobile), sử dụng PostgreSQL (Neon) làm database.

---

## 📁 Cấu trúc dự án

```
ViralBoard/
├── anything-viralboard-db/        # SQL schema & migration
│   ├── development.sql            # Schema cho môi trường dev
│   └── production.sql             # Schema cho môi trường production
└── vibe_board/anything/apps/
    ├── web/                       # React Router v7 + Vite (SSR)
    └── mobile/                    # Expo React Native (iOS & Android)
```

---

## 🗄️ 1. Deploy Database (Neon PostgreSQL)

### Yêu cầu
- Tài khoản [Neon](https://neon.tech) (hoặc PostgreSQL >= 17 tự host)
- `psql` CLI đã được cài đặt

### Bước 1 — Tạo database trên Neon

1. Đăng nhập vào [console.neon.tech](https://console.neon.tech)
2. Tạo project mới → chọn region gần nhất
3. Copy **Connection String** dạng:
   ```
   postgresql://user:password@host/dbname?sslmode=require
   ```

### Bước 2 — Chạy schema

**Môi trường Development:**
```bash
psql "postgresql://<user>:<password>@<host>/<dbname>?sslmode=require" \
  -f anything-viralboard-db/development.sql
```

**Môi trường Production:**
```bash
psql "postgresql://<user>:<password>@<host>/<dbname>?sslmode=require" \
  -f anything-viralboard-db/production.sql
```

### Schema tổng quan

| Bảng         | Mô tả                                          |
|--------------|------------------------------------------------|
| `boards`     | Board chứa các card, hỗ trợ public/share token |
| `cards`      | Card (video, note, image, pdf, text, collection) |
| `comments`   | Bình luận gắn vào từng card                    |
| `connectors` | Kết nối (arrow) giữa các card trên board        |

---

## 🌐 2. Deploy Web App

### Yêu cầu
- Node.js >= 20 hoặc [Bun](https://bun.sh) >= 1.x
- Neon connection string từ bước trên

### Bước 1 — Cài dependencies

```bash
cd vibe_board/anything/apps/web
bun install
# hoặc: npm install
```

### Bước 2 — Cấu hình biến môi trường

Tạo file `.env` tại `vibe_board/anything/apps/web/.env`:

```env
# Token project từ anything.com (hoặc tự quản lý)
ANYTHING_PROJECT_TOKEN=<your_project_token>

# Neon Database connection string
NEXT_PUBLIC_DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth (nếu dùng Auth.js)
AUTH_SECRET=<random_secret_32_chars>
AUTH_URL=https://your-domain.com

# Stripe (nếu bật thanh toán)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Bước 3 — Chạy Development

```bash
bun run dev
# Web sẽ chạy tại: http://localhost:4000
```

### Bước 4 — Build Production

```bash
bun run build
# hoặc: npm run build
```

### Bước 5 — Deploy lên server

#### Option A: Deploy thủ công (Node.js server)

```bash
# Build
bun run build

# Chạy production server
node ./build/server/index.js
```

#### Option B: Deploy lên [Railway](https://railway.app)

```bash
# Cài Railway CLI
npm install -g @railway/cli

railway login
railway init
railway up
```

Cấu hình biến môi trường trên Railway dashboard.

#### Option C: Deploy lên [Render](https://render.com)

1. Tạo **Web Service** → kết nối GitHub repo
2. **Build Command**: `cd vibe_board/anything/apps/web && bun install && bun run build`
3. **Start Command**: `node ./build/server/index.js`
4. Thêm các biến môi trường trong tab **Environment**

#### Option D: Deploy lên VPS (Ubuntu/Debian)

```bash
# Cài Bun
curl -fsSL https://bun.sh/install | bash

# Clone repo
git clone https://github.com/longtrieu2000/Vibe_Board.git
cd Vibe_Board/vibe_board/anything/apps/web

# Cài dependencies & build
bun install
bun run build

# Chạy với PM2
npm install -g pm2
pm2 start node --name "vibe-board-web" -- ./build/server/index.js
pm2 save
pm2 startup

# Cấu hình Nginx reverse proxy
# /etc/nginx/sites-available/vibe-board
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vibe-board /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📱 3. Deploy Mobile App (Expo)

### Yêu cầu
- Node.js >= 18
- Expo CLI & EAS CLI
- Tài khoản [Expo](https://expo.dev)
- (iOS) Tài khoản Apple Developer
- (Android) Tài khoản Google Play Console

### Bước 1 — Cài tools

```bash
npm install -g expo-cli eas-cli
```

### Bước 2 — Cài dependencies

```bash
cd vibe_board/anything/apps/mobile
npm install
```

### Bước 3 — Cấu hình biến môi trường

Tạo file `.env` tại `vibe_board/anything/apps/mobile/.env`:

```env
EXPO_PUBLIC_APP_URL=https://your-domain.com
EXPO_PUBLIC_BASE_URL=https://your-domain.com
EXPO_PUBLIC_HOST=your-domain.com
EXPO_PUBLIC_CREATE_ENV=PRODUCTION
EXPO_PUBLIC_PROJECT_GROUP_ID=<your_project_group_id>
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<google_maps_api_key>
EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY=<uploadcare_key>
EXPO_PUBLIC_LOGS_ENDPOINT=https://your-domain.com/api/logs
```

### Bước 4 — Đăng nhập EAS

```bash
eas login
eas build:configure   # Tạo EAS project lần đầu
```

### Bước 5 — Build

**Development build (test trên thiết bị thật):**
```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

**Preview build (chia sẻ QR code):**
```bash
eas build --profile preview --platform all
```

**Production build:**
```bash
# Build cả iOS và Android
eas build --profile production --platform all
```

### Bước 6 — Submit lên Store

```bash
# Submit lên Google Play
eas submit --platform android

# Submit lên App Store
eas submit --platform ios
```

### Chạy locally (Metro bundler)

```bash
cd vibe_board/anything/apps/mobile
npx expo start

# Quét QR bằng app Expo Go trên điện thoại
```

---

## 🔑 Biến môi trường tổng hợp

### Web App (`apps/web/.env`)

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `ANYTHING_PROJECT_TOKEN` | ✅ | Token xác thực project |
| `NEXT_PUBLIC_DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | Secret key cho Auth.js (>= 32 ký tự) |
| `AUTH_URL` | ✅ | URL production của web app |
| `STRIPE_SECRET_KEY` | ⚠️ | Bắt buộc nếu bật thanh toán |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⚠️ | Public key Stripe |

### Mobile App (`apps/mobile/.env`)

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `EXPO_PUBLIC_APP_URL` | ✅ | URL của web backend |
| `EXPO_PUBLIC_BASE_URL` | ✅ | Base URL API |
| `EXPO_PUBLIC_HOST` | ✅ | Hostname (không có https://) |
| `EXPO_PUBLIC_CREATE_ENV` | ✅ | `PRODUCTION` hoặc `DEVELOPMENT` |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | ⚠️ | Cần nếu dùng tính năng bản đồ |
| `EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY` | ⚠️ | Cần nếu upload file/ảnh |

---

## 🔄 CI/CD gợi ý (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Web

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install
        working-directory: vibe_board/anything/apps/web

      - name: Build
        run: bun run build
        working-directory: vibe_board/anything/apps/web
        env:
          ANYTHING_PROJECT_TOKEN: ${{ secrets.ANYTHING_PROJECT_TOKEN }}
          NEXT_PUBLIC_DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
          AUTH_URL: ${{ secrets.AUTH_URL }}

      - name: Deploy to server
        # Thêm bước SSH/rsync hoặc Railway/Render CLI ở đây
        run: echo "Deploy step"
```

---

## 🛠️ Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `connection refused` khi connect DB | Sai connection string | Kiểm tra lại URL Neon, thêm `?sslmode=require` |
| `auth secret missing` | Thiếu `AUTH_SECRET` | Thêm vào `.env`, chạy `openssl rand -hex 32` để tạo |
| Build mobile lỗi `Missing credentials` | Chưa đăng nhập EAS | Chạy `eas login` |
| Web không load sau deploy | Port sai | Đảm bảo app chạy port 4000, Nginx proxy đúng |
| `bun: command not found` | Chưa cài Bun | Chạy `curl -fsSL https://bun.sh/install \| bash` |

---

## 📞 Liên hệ & hỗ trợ

- **Repo**: [github.com/longtrieu2000/Vibe_Board](https://github.com/longtrieu2000/Vibe_Board)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Expo EAS Docs**: [docs.expo.dev/eas](https://docs.expo.dev/eas)
- **React Router v7 Docs**: [reactrouter.com](https://reactrouter.com)
