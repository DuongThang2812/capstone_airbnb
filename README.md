# Airbnb RESTful API - Ngày 1

Phạm vi: MySQL 5 bảng, NestJS + Prisma v5 + Swagger + JWT, 2 API Auth và 8 API Users. Chưa triển khai các module ViTri, Phong, DatPhong hoặc BinhLuan.

## Cấu trúc thư mục

```text
airbnb-day1/
├── .env.example
├── .gitignore
├── db_airbnb.sql
├── nest-cli.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
├── prisma/
│   └── schema.prisma
├── public/
│   └── img/
│       └── .gitkeep
└── src/
    ├── app.module.ts
    ├── main.ts
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   ├── jwt.strategy.ts
    │   └── dto/
    │       ├── sign-in.dto.ts
    │       └── sign-up.dto.ts
    ├── common/
    │   ├── api-exception.filter.ts
    │   ├── api-response.ts
    │   └── input.ts
    ├── prisma/
    │   ├── prisma.module.ts
    │   └── prisma.service.ts
    └── users/
        ├── dto/
        │   └── update-user.dto.ts
        ├── public-user.ts
        ├── users.controller.ts
        ├── users.module.ts
        └── users.service.ts
```

Mọi file mã nguồn trên đều có nội dung đầy đủ trong thư mục này. `package-lock.json` khóa phiên bản đã cài; `node_modules`, `dist`, `.env` và ảnh upload không nằm trong bộ mã giao nộp.

## Tạo project từ đầu

Nếu muốn tự dựng lại từ một thư mục trống, chạy từng lệnh sau trong PowerShell, rồi chép đè các file trong bộ mã này vào thư mục `airbnb-day1`:

```powershell
npx @nestjs/cli@10.4.9 new airbnb-day1 --package-manager npm --skip-git
cd airbnb-day1
npm install @nestjs/common@^10.4.22 @nestjs/config@^3.3.0 @nestjs/core@^10.4.22 @nestjs/jwt@^10.2.0 @nestjs/passport@^10.0.3 @nestjs/platform-express@^10.4.22 @nestjs/swagger@^7.4.2 @prisma/client@5.22.0 bcrypt@^5.1.1 passport@^0.7.0 passport-jwt@^4.0.1 reflect-metadata@^0.2.2 rxjs@^7.8.1 swagger-ui-express@^5.0.1
npm install -D @nestjs/cli@^10.4.9 @types/bcrypt@^5.0.2 @types/express@^4.17.21 @types/multer@^1.4.12 @types/node@^20.17.0 @types/passport-jwt@^4.0.1 prisma@5.22.0 typescript@^5.6.3
npx prisma init --datasource-provider mysql
```

Lệnh `prisma init` chỉ dùng khi dựng từ đầu. Bộ mã giao nộp đã có `prisma/schema.prisma`, nên không chạy lại lệnh đó trong thư mục đã giải nén.

## Chạy bộ mã đã giao nộp

Yêu cầu Node.js, npm và MySQL 8 đang chạy. Trong PowerShell, di chuyển vào thư mục chứa `package.json` của bộ mã:

```powershell
cd "C:\duong-dan\airbnb-day1"
npm ci
Copy-Item .env.example .env
notepad .env
```

Thay `your_password` trong `DATABASE_URL` bằng mật khẩu MySQL thật và thay `JWT_SECRET` bằng chuỗi bí mật dài. Nếu mật khẩu chứa ký tự đặc biệt như `@`, `:` hoặc `/`, hãy URL-encode chúng trong URL kết nối.

Đăng nhập MySQL rồi nạp file SQL. Nếu `mysql` chưa nằm trong PATH, dùng đường dẫn đầy đủ đến `mysql.exe`:

```powershell
mysql -u root -p
```

Tại dấu nhắc `mysql>`, chạy lệnh sau với **đường dẫn tuyệt đối thực tế** tới file SQL (dùng dấu `/` trong đường dẫn):

```sql
SOURCE C:/duong-dan/airbnb-day1/db_airbnb.sql;
EXIT;
```

`db_airbnb.sql` tạo database, 5 bảng và đúng 5 dòng dữ liệu mẫu cho mỗi bảng. Sau khi SQL đã chạy xong, tiếp tục quy trình Database-First:

```powershell
npx prisma db pull
npx prisma generate
npm run build
npm run start:dev
```

Mở `http://localhost:8080/swagger`. Khi đổi cấu trúc SQL, hãy chạy lại `npx prisma db pull` rồi `npx prisma generate`. File `prisma/schema.prisma` đi kèm thể hiện sẵn đúng 5 bảng để xem mã ngay cả trước khi kết nối database.

## Thử 10 API Ngày 1

1. `POST /api/auth/signup`: tạo tài khoản; `role` mặc định `USER` dù request có gửi role khác.
2. `POST /api/auth/signin`: đăng nhập bằng tài khoản mẫu `an@example.com` / `Password@123`; nhận `token`.
3. `GET /api/users`: lấy toàn bộ người dùng.
4. `POST /api/users`: thêm người dùng; mật khẩu được băm.
5. `DELETE /api/users?id=...`: xóa theo query.
6. `GET /api/users/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=An`: phân trang và lọc tên.
7. `GET /api/users/search/An`: tìm tên.
8. `POST /api/users/upload-avatar`: nhấn **Authorize** trong Swagger, nhập Bearer token từ bước 2, rồi chọn ảnh trong `formFile`.
9. `GET /api/users/1`: xem chi tiết.
10. `PUT /api/users/1`: cập nhật; dùng `birthday`, `password` ở DTO, hệ thống map sang `birth_day`, `pass_word` trong database.

Phản hồi thành công và lỗi đều có `statusCode`, `message`, `content`, `dateTime`. Mật khẩu không được trả về. Ảnh upload được lưu tại `public/img` và truy cập qua `/public/img/<ten-file>`.
