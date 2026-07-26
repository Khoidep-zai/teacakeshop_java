# Hướng dẫn Docker — Tea & Cake Shop

Tài liệu Docker, biến môi trường và GitHub Codespaces đã được hợp nhất vào
[README.md](README.md) để tránh nhiều hướng dẫn khác nhau bị lệch cấu hình.

Các mục cần đọc:

- [Biến môi trường](README.md#6-biến-môi-trường)
- [Chạy bằng Docker](README.md#8-chạy-bằng-docker)
- [Đưa hệ thống lên GitHub Codespaces](README.md#10-đưa-hệ-thống-lên-github-codespaces)
- [Kiểm tra trước khi đưa lên Git](README.md#13-kiểm-tra-trước-khi-đưa-lên-git)

Khởi động nhanh:

```bash
cp .env.example .env
# Thay toàn bộ mật khẩu và secret mẫu trong .env
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs -f backend
```

Ứng dụng chạy tại <http://localhost:8080>.

MySQL chỉ hoạt động trong Docker network và không được publish ra máy host.
Không dùng `docker compose down -v` nếu muốn giữ dữ liệu.
