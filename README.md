# 🍵🍰 TEA & CAKE SHOP - FULLSTACK APPLICATION
**Hệ Thống Quản Lý & Cửa Hàng Trà & Bánh Ngọt Cao Cấp (Spring Boot 4 + React 18 Vite + MySQL + TailwindCSS)**

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-blue.svg?style=flat&logo=mysql)](https://www.mysql.com/)
[![Swagger](https://img.shields.io/badge/OpenAPI%203-Swagger%20UI-85EA2D.svg?style=flat&logo=swagger)](http://localhost:8080/swagger-ui.html)

---

## 📖 Mục lục
1. [Giới thiệu tổng quan](#1--giới-thiệu-tổng-quan)
2. [Các tính năng nổi bật (Core Features)](#2--các-tính-năng-nổi-bật-core-features)
3. [Giao diện ứng dụng (Screenshots & UI Design)](#3--giao-diện-ứng-dụng-screenshots--ui-design)
4. [Công nghệ sử dụng (Tech Stack)](#4--công-nghệ-sử-dụng-tech-stack)
5. [Hướng dẫn Cài đặt & Khởi chạy (Installation & Setup)](#5--hướng-dẫn-cài-đặt--khởi-chạy-installation--setup)
6. [Cấu trúc Dự án (Folder Structure)](#6--cấu-trúc-dự-án-folder-structure)

---

## 1. 🌟 Giới thiệu tổng quan

**Tea & Cake Shop** là ứng dụng Web Fullstack hiện đại, toàn diện dành cho mô hình kinh doanh **Cửa hàng Trà & Bánh ngọt cao cấp**. 

Ứng dụng kết hợp giữa nền tảng **Spring Boot RESTful Backend API** bảo mật với giao diện **React Vite Frontend** được thiết kế hiện đại, lấy cảm hứng từ phong cách thân thiện của Duolingo với tông màu Trà xanh (#4CAF82) và Bánh ngọt (#FF7043).

### 🎯 Điểm nổi bật
- **Giao diện hiện đại & Đa nền tảng**: Hỗ trợ đầy đủ **Chế độ Sáng / Tối (Light & Dark Mode)** và **Đa ngôn ngữ Anh / Việt (i18n)**.
- **Gợi ý món thông minh (Tea & Cake Pairing)**: Đề xuất bánh ăn kèm hoàn hảo khi chọn trà và gợi ý Combo tiết kiệm theo thời tiết (Nắng, Mưa, Se lạnh...).
- **Đa dạng dịch vụ**: Mua hàng Online, Thanh toán thử nghiệm (Momo, VNPay, COD, Chuyển khoản) & Đặt bàn trước tại quán.
- **Trang Quản trị Admin Dashboard**: Thống kê biểu đồ doanh thu daily, quản lý đơn hàng, người dùng, sản phẩm, combo và chương trình khuyến mãi.

---

## 2. 🚀 Các tính năng nổi bật (Core Features)

### 🎨 1. Trải nghiệm Khách hàng (Client Portal)
- 🌓 **Chuyển đổi Sáng / Tối**: Lưu trạng thái theme vào LocalStorage.
- 🌐 **Đa ngôn ngữ Vi / En**: Tự động chuyển đổi toàn bộ giao diện bằng React i18next.
- 🍵 **Thực đơn Trà & Bánh**: Phân loại theo danh mục, mức độ hot, bán chạy, lọc theo trà/bánh, lọc theo hương vị & nhiệt độ (Nóng / Lạnh).
- 💡 **Gợi ý món thông minh**: Xem món gợi ý đi kèm khi vào trang chi tiết sản phẩm.
- 🌤️ **Combo theo thời tiết**: Chọn combo phù hợp với thời tiết hiện tại.
- 🛒 **Giỏ hàng & Thanh toán**: Thêm/sửa/xóa sản phẩm, chọn mã giảm giá và thanh toán nhanh.
- 📅 **Đặt bàn trực tuyến**: Chọn ngày, giờ, số lượng khách và ghi chú đặc biệt.
- 📦 **Theo dõi đơn hàng**: Xem tiến trình đơn hàng (Chờ xử lý ➔ Đã xác nhận ➔ Đang chuẩn bị ➔ Hoàn thành).

### 🛠️ 2. Trang Quản trị (Admin Portal)
- 📊 **Dashboard Thống kê**: Biểu đồ doanh thu theo ngày (Recharts), tổng số đơn hàng, khách hàng và danh sách món sắp hết hàng.
- 🛍️ **Quản lý Thực đơn & Combo**: Thêm, sửa, xóa sản phẩm, danh mục, gói combo và hình ảnh Cloudinary.
- 🏷️ **Quản lý Khuyến mãi**: Tạo và quản lý mã giảm giá (Discount Campaigns).
- 📋 **Quản lý Đơn hàng & Đặt bàn**: Cập nhật trạng thái đơn hàng và duyệt lịch đặt bàn của khách.
- 👥 **Quản lý Người dùng**: Phân quyền (ADMIN / CUSTOMER / STAFF) và khóa/mở khóa tài khoản.

---

## 3. 🖼️ Giao diện ứng dụng (Screenshots & UI Design)

| Feature | Trang Khách Hàng | Trang Quản Trị Admin |
| :--- | :--- | :--- |
| **Theme** | Support Light / Dark Mode | Modern Sidebar Layout |
| **Language** | Tiếng Việt / English | Vi / En i18n ready |

### 📸 Ảnh mẫu giao diện chính:
- **Trang chủ (Hero & Featured Items)**: Banner hoạt hình, danh sách sản phẩm nổi bật & combo ưu đãi.
- **Chi tiết sản phẩm & Gợi ý**: Hình ảnh sắc nét, tùy chọn số lượng, danh sách món gợi ý đi kèm.
- **Giỏ hàng & Thanh toán**: Tóm tắt đơn hàng, lựa chọn 4 phương thức thanh toán.
- **Admin Dashboard**: Biểu đồ doanh thu Recharts & các thẻ chỉ số tổng quan.

---

## 4. 🛠️ Công nghệ sử dụng (Tech Stack)

### 🔹 Backend Stack
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 4.1.0 / 3.4.x
- **Security**: Spring Security + OAuth2 Resource Server + JWT (Access Token & Refresh Token Blacklisting)
- **Database**: MySQL 8.4
- **ORM**: Spring Data JPA + Hibernate 7
- **Cloud Media**: Cloudinary SDK (`cloudinary-http5`)
- **API Docs**: Springdoc OpenAPI 3 (Swagger UI)

### 🔹 Frontend Stack
- **Framework**: React 18 + TypeScript + Vite 5
- **Styling**: TailwindCSS 3 + Custom Color Variables + Lucide Icons
- **Animation**: Framer Motion
- **State & Context**: Context API (AuthContext, CartContext, ThemeContext)
- **Http Client**: Axios với JWT Request Interceptors & Auto Refresh Token Queue
- **Internationalization**: react-i18next (Vi / En)
- **Charts**: Recharts

---

## 5. 💻 Hướng dẫn Cài đặt & Khởi chạy (Installation & Setup)

### 1️⃣ Khởi chạy Backend (Spring Boot)
1. Đảm bảo MySQL 8.x đang chạy ở `localhost:3306` (Password default trong application.properties: `12345`).
2. Mở terminal tại thư mục gốc `teacakeshop` và chạy:
   ```powershell
   # Windows:
   .\mvnw.cmd spring-boot:run

   # Linux/macOS:
   ./mvnw spring-boot:run
   ```
3. Backend sẽ khởi chạy tại: `http://localhost:8080` (Swagger UI: `http://localhost:8080/swagger-ui.html`).

### 2️⃣ Khởi chạy Frontend (React Vite)
1. Di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện (nếu chưa cài):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Khởi chạy server phát triển:
   ```bash
   npm run dev
   ```
4. Trình duyệt sẽ **tự động mở trang web** tại: `http://localhost:5173`.

---

## 6. 📂 Cấu trúc Dự án (Folder Structure)

```text
teacakeshop/
├── frontend/                       # React 18 + Vite Frontend Application
│   ├── public/                     # Favicon và các tài nguyên tĩnh
│   ├── src/
│   │   ├── api/                    # Axios API Modules (Auth, Products, Combos, Cart, Orders...)
│   │   ├── components/             # Reusable Components (Navbar, Footer, ProductCard, ComboCard, AdminSidebar...)
│   │   ├── contexts/               # React Contexts (AuthContext, CartContext, ThemeContext)
│   │   ├── hooks/                  # Custom Hooks (useAuth, useCart, useTheme)
│   │   ├── i18n/                   # Cấu hình đa ngôn ngữ (vi.json, en.json)
│   │   ├── pages/                  # Các trang chính (Home, Products, Combos, Cart, Checkout, Profile...)
│   │   │   └── admin/              # Các trang Admin (Dashboard, AdminProducts, AdminOrders...)
│   │   ├── styles/                 # Global CSS & Tailwind utilities
│   │   ├── types/                  # TypeScript Data Types & Interfaces
│   │   ├── App.tsx                 # Main Routing & App Layout
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   └── vite.config.ts              # Proxy /api sang http://localhost:8080 & Auto-open browser
│
├── src/main/java/com/example/teacakeshop/  # Spring Boot Backend
│   ├── config/                     # Security, CORS, Jackson, Cloudinary configs
│   ├── controller/                 # Admin, Customer & Public REST Controllers
│   ├── dto/                        # Request & Response DTOs
│   ├── entity/                     # JPA Entities (Product, Combo, Order, Cart, Reservation...)
│   ├── repository/                 # Spring Data JPA Repositories
│   └── service/                    # Business Logic Layer
│
├── README.md                       # Tài liệu tổng quan dự án này
├── pom.xml                         # Maven dependencies config
└── api-test.http                   # File kịch bản test HTTP APIs
```

---

## 👨‍💻 Tài khoản dùng thử mặc định

- **Admin Account**:
  - Email: `admin@teacakeshop.com`
  - Password: `Admin@123`

---
🎉 **Chúc bạn có trải nghiệm tuyệt vời với ứng dụng Tea & Cake Shop!** 🍵🍰
