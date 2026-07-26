# Chạy Tea & Cake Shop trên GitHub Codespaces

Ứng dụng dùng một URL công khai duy nhất:

- Port `8080`: React + Spring Boot API.
- MySQL chỉ chạy trong Docker network và không được công khai.
- Không cần mở port `5173` hoặc `3306`.

## 1. Tạo Codespaces secrets

Trên GitHub, mở repository rồi vào:

`Settings → Secrets and variables → Codespaces → New repository secret`

Tạo bốn secret:

- `MYSQL_ROOT_PASSWORD`: mật khẩu database mạnh.
- `JWT_SECRET`: chuỗi Base64 giải mã được tối thiểu 32 bytes.
- `ADMIN_PASSWORD`: mật khẩu admin.
- `STAFF_PASSWORD`: mật khẩu staff.

Tạo JWT secret bằng terminal cục bộ:

```bash
openssl rand -base64 48
```

Không commit file `.env` hoặc giá trị các secret lên GitHub.

## 2. Tạo hoặc rebuild Codespace

Tại trang repository:

`Code → Codespaces → Create codespace on main`

Nếu Codespace đã tồn tại trước khi có `.devcontainer`, chạy:

`Ctrl+Shift+P → Codespaces: Rebuild Container`

## 3. Khởi động toàn bộ hệ thống

Trong terminal Codespace:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend
```

Khi log có thông báo Spring Boot đã started, nhấn `Ctrl+C` để thoát chế độ xem log. Container vẫn tiếp tục chạy.

## 4. Cho mọi người xem

1. Mở tab `PORTS` trong Codespace.
2. Tìm port `8080` có nhãn `Tea & Cake Shop`.
3. Nhấp chuột phải → `Port Visibility` → `Public`.
4. Sao chép `Forwarded Address` và gửi URL đó cho người xem.

URL có dạng:

```text
https://<codespace-name>-8080.app.github.dev
```

Không chuyển port MySQL thành public.

## 5. Lệnh vận hành

```bash
# Xem trạng thái
docker compose ps

# Xem log
docker compose logs -f backend
docker compose logs -f mysql

# Khởi động lại
docker compose restart

# Dừng hệ thống nhưng giữ dữ liệu MySQL
docker compose down

# Build lại sau khi sửa code
docker compose up --build -d
```

Không dùng `docker compose down -v` nếu muốn giữ dữ liệu database.

## Lưu ý về Codespaces

Codespaces là môi trường phát triển, không phải hosting 24/7. Khi Codespace dừng hoặc hết thời gian chờ, website cũng dừng. Sau khi khởi động lại, cần kiểm tra port `8080` vẫn có visibility `Public`.
