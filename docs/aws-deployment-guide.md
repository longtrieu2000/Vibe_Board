# ☁️ Vibe Board — AWS Deployment Guide (A → Z)

> Hướng dẫn đầy đủ deploy Web App + Database lên AWS từ đầu đến cuối.
> **Stack**: EC2 (Web) + RDS PostgreSQL (DB) + S3 (Assets) + ACM + Route 53 + CloudFront

---

## 📐 Kiến trúc tổng quan

```
Internet
    │
    ▼
Route 53 (DNS)
    │
    ▼
CloudFront (CDN + HTTPS)
    │
    ▼
Application Load Balancer (ALB)
    │
    ▼
EC2 Instance (Node.js / Bun + Nginx)
    │     │
    │     └──► S3 Bucket (static assets / uploads)
    │
    ▼
RDS PostgreSQL (Private Subnet)
```

---

## ✅ Yêu cầu trước khi bắt đầu

- [ ] Tài khoản AWS đã kích hoạt billing
- [ ] AWS CLI đã cài và cấu hình (`aws configure`)
- [ ] Domain đã mua (Route 53 hoặc bên ngoài)
- [ ] SSH key pair đã tạo trên máy local
- [ ] Git repo đã có code

---

## 📦 Phần 1 — Chuẩn bị AWS Account

### 1.1 Cài AWS CLI

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Xác nhận
aws --version
```

### 1.2 Cấu hình credentials

```bash
aws configure
# AWS Access Key ID: <your_access_key>
# AWS Secret Access Key: <your_secret_key>
# Default region name: ap-southeast-1        ← Singapore (gần VN nhất)
# Default output format: json
```

### 1.3 Tạo IAM User riêng (khuyến nghị, không dùng root)

```bash
# Tạo user deploy
aws iam create-user --user-name vibe-board-deploy

# Gán quyền
aws iam attach-user-policy \
  --user-name vibe-board-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess

aws iam attach-user-policy \
  --user-name vibe-board-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

aws iam attach-user-policy \
  --user-name vibe-board-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Tạo access key
aws iam create-access-key --user-name vibe-board-deploy
```

---

## 🌐 Phần 2 — Thiết lập VPC & Network

### 2.1 Tạo VPC

Vào **AWS Console → VPC → Create VPC**:

| Tham số | Giá trị |
|---------|---------|
| Name | `vibe-board-vpc` |
| IPv4 CIDR | `10.0.0.0/16` |
| Tenancy | Default |

### 2.2 Tạo Subnets

Tạo **2 Public Subnet** (cho EC2/ALB) và **2 Private Subnet** (cho RDS):

```
Public Subnet 1:  10.0.1.0/24  →  AZ: ap-southeast-1a
Public Subnet 2:  10.0.2.0/24  →  AZ: ap-southeast-1b
Private Subnet 1: 10.0.3.0/24  →  AZ: ap-southeast-1a
Private Subnet 2: 10.0.4.0/24  →  AZ: ap-southeast-1b
```

### 2.3 Tạo Internet Gateway

```
VPC → Internet Gateways → Create → Attach to vibe-board-vpc
```

### 2.4 Cấu hình Route Table

- **Public Route Table**: thêm route `0.0.0.0/0 → Internet Gateway`
- Associate với 2 Public Subnet

### 2.5 Tạo Security Groups

**SG cho EC2 (Web Server):**

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | Your IP only |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| Custom TCP | 4000 | ALB Security Group |

**SG cho RDS (Database):**

| Type | Port | Source |
|------|------|--------|
| PostgreSQL | 5432 | EC2 Security Group |

---

## 🗄️ Phần 3 — Deploy Database (RDS PostgreSQL)

> **Lựa chọn thay thế**: Nếu muốn tiếp tục dùng **Neon** (đang dùng trong `.env`), bỏ qua phần 3 này và giữ nguyên connection string Neon.

### 3.1 Tạo DB Subnet Group

```
RDS → Subnet Groups → Create DB Subnet Group
  Name: vibe-board-db-subnet-group
  VPC: vibe-board-vpc
  Subnets: Private Subnet 1 + Private Subnet 2
```

### 3.2 Tạo RDS Instance

```
RDS → Create Database
  Engine: PostgreSQL 17
  Template: Free Tier (dev) / Production
  DB instance identifier: vibe-board-db
  Master username: postgres
  Master password: <strong_password>
  Instance class: db.t3.micro (dev) / db.t3.medium (prod)
  Storage: 20 GB gp3
  VPC: vibe-board-vpc
  Subnet Group: vibe-board-db-subnet-group
  Public access: NO ← quan trọng
  VPC Security Group: sg-rds (đã tạo ở 2.5)
  Database name: vibeboarddb
```

> ⏳ Chờ khoảng 5-10 phút để RDS khởi động.

### 3.3 Lấy RDS Endpoint

```
RDS → Databases → vibe-board-db → Endpoint & port
# Ví dụ: vibe-board-db.xxxxxx.ap-southeast-1.rds.amazonaws.com:5432
```

### 3.4 Chạy Schema Migration

Từ EC2 (sau khi tạo ở Phần 4), SSH vào và chạy:

```bash
# Upload file SQL lên EC2 từ máy local
scp -i ~/.ssh/vibe-board-key.pem \
  anything-viralboard-db/development.sql \
  ubuntu@<EC2_PUBLIC_IP>:/home/ubuntu/

# SSH vào EC2 rồi chạy
psql "postgresql://postgres:<password>@<RDS_ENDPOINT>:5432/vibeboarddb" \
  -f /home/ubuntu/development.sql
```

---

## 🖥️ Phần 4 — Deploy Web App lên EC2

### 4.1 Tạo Key Pair

```bash
# Tạo key pair
aws ec2 create-key-pair \
  --key-name vibe-board-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/vibe-board-key.pem

chmod 400 ~/.ssh/vibe-board-key.pem
```

### 4.2 Tạo EC2 Instance

```
EC2 → Launch Instance
  Name: vibe-board-web
  AMI: Ubuntu Server 24.04 LTS (64-bit)
  Instance type: t3.small (dev) / t3.medium (prod)
  Key pair: vibe-board-key
  Network: vibe-board-vpc
  Subnet: Public Subnet 1
  Auto-assign Public IP: Enable
  Security Group: sg-ec2 (đã tạo ở 2.5)
  Storage: 20 GB gp3
```

### 4.3 Kết nối SSH vào EC2

```bash
ssh -i ~/.ssh/vibe-board-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### 4.4 Cài môi trường trên EC2

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Cài Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Cài PM2 (process manager)
sudo npm install -g pm2

# Cài Nginx
sudo apt install -y nginx

# Cài Git
sudo apt install -y git

# Cài psql (để chạy migration)
sudo apt install -y postgresql-client

# Xác nhận
node --version && bun --version && pm2 --version && nginx -v
```

### 4.5 Clone và Build Web App

```bash
# Clone repo
git clone https://github.com/longtrieu2000/Vibe_Board.git
cd Vibe_Board/vibe_board/anything/apps/web

# Tạo file .env production
cat > .env << 'EOF'
ANYTHING_PROJECT_TOKEN=<your_project_token>
NEXT_PUBLIC_DATABASE_URL=postgresql://postgres:<password>@<RDS_ENDPOINT>:5432/vibeboarddb
AUTH_SECRET=<openssl rand -hex 32 result>
AUTH_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EOF

# Cài dependencies
bun install --frozen-lockfile

# Build production
bun run build
```

> 💡 Tạo `AUTH_SECRET` bằng lệnh: `openssl rand -hex 32`

### 4.6 Cấu hình PM2

```bash
# Tạo ecosystem config
cat > /home/ubuntu/Vibe_Board/vibe_board/anything/apps/web/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'vibe-board-web',
    script: './build/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/pm2/vibe-board-error.log',
    out_file: '/var/log/pm2/vibe-board-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

# Tạo thư mục log
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Start app
pm2 start ecosystem.config.cjs

# Lưu config để auto-restart khi reboot
pm2 save
pm2 startup
# Copy và chạy lệnh mà PM2 in ra
```

### 4.7 Cấu hình Nginx

```bash
# Xóa config mặc định
sudo rm /etc/nginx/sites-enabled/default

# Tạo config mới
sudo tee /etc/nginx/sites-available/vibe-board << 'EOF'
upstream vibe_board_app {
    server 127.0.0.1:4000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://vibe_board_app;
    }

    # API & App
    location / {
        proxy_pass http://vibe_board_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/vibe-board /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔐 Phần 5 — SSL/HTTPS với ACM + Certificate Manager

### 5.1 Xin SSL Certificate (ACM)

```
AWS Console → Certificate Manager (ACM) → Request Certificate
  Region: us-east-1 (bắt buộc nếu dùng CloudFront)
       hoặc ap-southeast-1 (nếu chỉ dùng ALB)
  Domain: your-domain.com
  Add another name: *.your-domain.com
  Validation: DNS validation
```

### 5.2 Xác nhận domain (DNS Validation)

ACM sẽ cung cấp CNAME record → thêm vào DNS provider của bạn.

Nếu dùng Route 53: nhấn **"Create records in Route 53"** → tự động.

> ⏳ Chờ 5-15 phút để ACM xác nhận.

### 5.3 Cài Certbot trực tiếp trên EC2 (Phương án thay thế đơn giản hơn)

```bash
# Cài Certbot
sudo apt install -y certbot python3-certbot-nginx

# Xin cert (yêu cầu domain đã trỏ về IP EC2)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com \
  --email your@email.com --agree-tos --non-interactive

# Auto-renew (đã cài sẵn, kiểm tra)
sudo systemctl status certbot.timer
```

Certbot sẽ tự động cập nhật Nginx config để hỗ trợ HTTPS.

---

## 🌍 Phần 6 — Route 53 (DNS)

### 6.1 Tạo Hosted Zone

```
Route 53 → Hosted Zones → Create hosted zone
  Domain: your-domain.com
  Type: Public hosted zone
```

### 6.2 Cập nhật Nameservers

Copy 4 nameserver từ Route 53 → Cập nhật vào nhà đăng ký domain.

### 6.3 Tạo A Record

```
Route 53 → Hosted Zone → Create Record
  Record name: @ (hoặc để trống)
  Type: A
  Value: <EC2_PUBLIC_IP>
  TTL: 300
```

```
  Record name: www
  Type: CNAME
  Value: your-domain.com
```

---

## 🗃️ Phần 7 — S3 Bucket (File Uploads)

### 7.1 Tạo S3 Bucket

```bash
aws s3api create-bucket \
  --bucket vibe-board-uploads \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1
```

### 7.2 Cấu hình CORS

```bash
aws s3api put-bucket-cors \
  --bucket vibe-board-uploads \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://your-domain.com"],
      "ExposeHeaders": ["ETag"]
    }]
  }'
```

### 7.3 Tạo IAM Policy cho S3

```bash
aws iam create-policy \
  --policy-name VibeBoardS3Policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::vibe-board-uploads/*"
    }]
  }'
```

Thêm vào `.env` của web app:

```env
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=vibe-board-uploads
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
```

---

## ⚡ Phần 8 — CloudFront (CDN) — Tùy chọn

CloudFront giúp cache static assets và giảm latency cho user ở xa.

```
CloudFront → Create Distribution
  Origin Domain: your-domain.com
  Protocol: HTTPS Only
  Viewer Protocol Policy: Redirect HTTP to HTTPS
  Cache Policy: CachingOptimized (static) / CachingDisabled (API)
  Alternate Domain: cdn.your-domain.com
  SSL Certificate: chọn cert đã tạo ở ACM (us-east-1)
```

---

## 🔄 Phần 9 — CI/CD tự động với GitHub Actions

### 9.1 Thêm Secrets vào GitHub

```
GitHub repo → Settings → Secrets and variables → Actions → New secret
```

| Secret | Giá trị |
|--------|---------|
| `AWS_EC2_HOST` | Public IP của EC2 |
| `AWS_EC2_USER` | `ubuntu` |
| `AWS_EC2_SSH_KEY` | Nội dung file `vibe-board-key.pem` |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret key Auth.js |
| `AUTH_URL` | `https://your-domain.com` |
| `ANYTHING_PROJECT_TOKEN` | Project token |

### 9.2 Tạo workflow file

Tạo file `.github/workflows/deploy-aws.yml`:

```yaml
name: 🚀 Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Build & Deploy Web App
    runs-on: ubuntu-latest

    steps:
      - name: ⬇️ Checkout code
        uses: actions/checkout@v4

      - name: 🟡 Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: 📦 Install dependencies
        working-directory: vibe_board/anything/apps/web
        run: bun install --frozen-lockfile

      - name: 🏗️ Build app
        working-directory: vibe_board/anything/apps/web
        run: bun run build
        env:
          ANYTHING_PROJECT_TOKEN: ${{ secrets.ANYTHING_PROJECT_TOKEN }}
          NEXT_PUBLIC_DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
          AUTH_URL: ${{ secrets.AUTH_URL }}

      - name: 📤 Sync files to EC2
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.AWS_EC2_HOST }}
          username: ${{ secrets.AWS_EC2_USER }}
          key: ${{ secrets.AWS_EC2_SSH_KEY }}
          source: "vibe_board/anything/apps/web/build/"
          target: "/home/ubuntu/Vibe_Board/vibe_board/anything/apps/web/"

      - name: 🔄 Restart PM2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.AWS_EC2_HOST }}
          username: ${{ secrets.AWS_EC2_USER }}
          key: ${{ secrets.AWS_EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/Vibe_Board/vibe_board/anything/apps/web
            pm2 reload vibe-board-web --update-env
            pm2 save
            echo "✅ Deploy thành công!"
```

---

## 📱 Phần 10 — Mobile App (Expo EAS Build)

Mobile app vẫn build qua EAS, chỉ cần cập nhật `EXPO_PUBLIC_BASE_URL` trỏ về domain AWS.

### 10.1 Cập nhật .env mobile

```env
EXPO_PUBLIC_APP_URL=https://your-domain.com
EXPO_PUBLIC_BASE_URL=https://your-domain.com
EXPO_PUBLIC_HOST=your-domain.com
EXPO_PUBLIC_CREATE_ENV=PRODUCTION
```

### 10.2 Build và submit

```bash
cd vibe_board/anything/apps/mobile

# Install EAS CLI
npm install -g eas-cli
eas login

# Build production
eas build --profile production --platform all

# Submit lên store
eas submit --platform android
eas submit --platform ios
```

---

## 📊 Phần 11 — Monitoring & Logs

### 11.1 Xem log ứng dụng

```bash
# Log PM2
pm2 logs vibe-board-web
pm2 logs vibe-board-web --lines 200

# Log Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 11.2 CloudWatch Agent (AWS native monitoring)

```bash
# Cài CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Config cơ bản
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 11.3 Kiểm tra sức khỏe EC2

```bash
# Xem tài nguyên
htop

# Xem PM2 dashboard
pm2 monit

# Kiểm tra disk
df -h

# Kiểm tra memory
free -m
```

---

## 💰 Ước tính chi phí AWS (hàng tháng)

| Dịch vụ | Instance | Chi phí ước tính |
|---------|----------|-----------------|
| EC2 | t3.small (2 vCPU, 2GB RAM) | ~$15/tháng |
| RDS PostgreSQL | db.t3.micro | ~$25/tháng |
| S3 | 10GB storage | ~$0.23/tháng |
| Route 53 | 1 hosted zone | ~$0.50/tháng |
| CloudFront | 10GB transfer | ~$1/tháng |
| **Tổng** | | **~$42/tháng** |

> 💡 Dùng **Neon** thay RDS để tiết kiệm ~$25/tháng (Neon có free tier).
> 💡 EC2 t3.micro đủ dùng cho giai đoạn đầu, nằm trong **AWS Free Tier** (12 tháng đầu).

---

## 🛠️ Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| EC2 không SSH được | Security Group sai | Kiểm tra inbound rule port 22, đúng IP của bạn |
| App chạy nhưng không vào được web | Nginx chưa start | `sudo systemctl restart nginx` |
| 502 Bad Gateway | PM2 app chưa chạy | `pm2 status` → `pm2 start ecosystem.config.cjs` |
| RDS connection timeout | Security Group RDS | Cho phép EC2 SG kết nối port 5432 vào RDS SG |
| Build thất bại thiếu RAM | EC2 RAM quá thấp | Dùng t3.small trở lên hoặc thêm swap 2GB |
| HTTPS không hoạt động | Cert chưa valid | Đợi ACM validate hoặc kiểm tra Certbot |
| `bun run build` lỗi OOM | Không đủ RAM | Tạo swap: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` |

### Thêm Swap (nếu thiếu RAM khi build)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔒 Security Checklist

- [ ] EC2 chỉ cho phép SSH từ IP của bạn (không dùng `0.0.0.0/0`)
- [ ] RDS không có Public Access
- [ ] `.env` không commit lên Git (đã có trong `.gitignore`)
- [ ] Auth Secret được generate ngẫu nhiên (`openssl rand -hex 32`)
- [ ] Dùng IAM Role cho EC2 thay vì hardcode AWS key trong app
- [ ] Bật MFA cho AWS root account
- [ ] Bật AWS CloudTrail để audit log
- [ ] Backup RDS tự động đã bật (retention >= 7 ngày)

---

## 📋 Checklist Deploy lần đầu

```
[ ] Tạo VPC + Subnets + Security Groups
[ ] Tạo RDS và chạy schema migration
[ ] Launch EC2, cài Node/Bun/PM2/Nginx
[ ] Clone repo, tạo .env, bun install, bun run build
[ ] Start app với PM2, cấu hình Nginx
[ ] Trỏ domain về IP EC2 qua Route 53
[ ] Cài SSL với Certbot hoặc ACM
[ ] Test https://your-domain.com hoạt động
[ ] Setup GitHub Actions CI/CD
[ ] Cập nhật .env mobile với URL production
[ ] Build mobile với EAS và submit store
[ ] Bật CloudWatch monitoring
```

---

## 📞 Tài nguyên tham khảo

- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [AWS RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Expo EAS Build](https://docs.expo.dev/eas/build/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Certbot Nginx](https://certbot.eff.org/instructions?os=ubuntufocal&certifiedServer=nginx)
- [React Router v7 Deployment](https://reactrouter.com/start/framework/deploying)
