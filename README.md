# Airbnb RESTful API - Capstone Node.js

Dự án backend Airbnb gồm 6 cụm API: `Auth`, `NguoiDung`, `ViTri`, `Phong`, `DatPhong`, `BinhLuan`. Tổng cộng có **36 endpoint** theo danh sách yêu cầu: 10 API Ngày 1, 15 API Ngày 2 và 11 API Ngày 3. Khi dùng MySQL local, có thể tạo bảng bằng `db_airbnb.sql`; khi dùng Aiven Cloud, Prisma đồng bộ bảng từ `prisma/schema.prisma` và `prisma/seed.mjs` tạo dữ liệu mẫu.

## Công nghệ sử dụng

- NestJS, TypeScript, Prisma v5 và MySQL 8.
- JWT, Passport và bcrypt cho đăng nhập; Multer lưu ảnh ở `public/img`.
- Swagger UI tại `/swagger`; Postman Collection để kiểm thử và nộp bài.
- Docker Compose để chạy MySQL và API bằng hai service.

## Cấu trúc thư mục

```text
airbnb/
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── Airbnb_Capstone.postman_collection.json
├── db_airbnb.sql
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.build.json
├── scripts/
│   └── e2e-verify.cjs
├── prisma/
│   ├── ca.pem
│   ├── schema.prisma
│   └── seed.mjs
├── public/
│   └── img/
│       └── .gitkeep
└── src/
    ├── app.module.ts
    ├── main.ts
    ├── binh-luan/
    │   ├── dto/binh-luan.dto.ts
    │   ├── binh-luan.controller.ts
    │   ├── binh-luan.mapper.ts
    │   ├── binh-luan.module.ts
    │   └── binh-luan.service.ts
    ├── dat-phong/
    │   ├── dto/dat-phong.dto.ts
    │   ├── dat-phong.controller.ts
    │   ├── dat-phong.mapper.ts
    │   ├── dat-phong.module.ts
    │   └── dat-phong.service.ts
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
    │   ├── date.ts
    │   └── input.ts
    ├── prisma/
    │   ├── prisma.module.ts
    │   └── prisma.service.ts
    ├── vi-tri/
    │   ├── dto/vi-tri.dto.ts
    │   ├── vi-tri.controller.ts
    │   ├── vi-tri.mapper.ts
    │   ├── vi-tri.module.ts
    │   └── vi-tri.service.ts
    ├── phong-thue/
    │   ├── dto/phong-thue.dto.ts
    │   ├── phong-thue.controller.ts
    │   ├── phong-thue.mapper.ts
    │   ├── phong-thue.module.ts
    │   └── phong-thue.service.ts
    └── users/
        ├── dto/
        │   └── update-user.dto.ts
        ├── public-user.ts
        ├── users.controller.ts
        ├── users.module.ts
        └── users.service.ts
```

`package-lock.json` khóa phiên bản đã cài. `.env`, `node_modules`, `dist` và ảnh upload không được đưa lên Git. `prisma/ca.pem` là chứng chỉ CA công khai tải từ Aiven để xác thực kết nối TLS.

## Tạo project từ đầu

Nếu muốn tự dựng lại từ một thư mục trống, chạy từng lệnh sau trong PowerShell, rồi chép đè các file trong bộ mã này vào thư mục `airbnb-capstone`:

```powershell
npx @nestjs/cli@10.4.9 new airbnb-capstone --package-manager npm --skip-git
cd airbnb-capstone
npm install @nestjs/common@^10.4.22 @nestjs/config@^3.3.0 @nestjs/core@^10.4.22 @nestjs/jwt@^10.2.0 @nestjs/passport@^10.0.3 @nestjs/platform-express@^10.4.22 @nestjs/swagger@^7.4.2 @prisma/client@5.22.0 bcrypt@^5.1.1 passport@^0.7.0 passport-jwt@^4.0.1 reflect-metadata@^0.2.2 rxjs@^7.8.1 swagger-ui-express@^5.0.1
npm install -D @nestjs/cli@^10.4.9 @types/bcrypt@^5.0.2 @types/express@^4.17.21 @types/multer@^1.4.12 @types/node@^20.17.0 @types/passport-jwt@^4.0.1 prisma@5.22.0 typescript@^5.6.3
npx prisma init --datasource-provider mysql
```

Lệnh `prisma init` chỉ dùng khi dựng từ đầu. Bộ mã giao nộp đã có `prisma/schema.prisma`, nên không chạy lại lệnh đó trong thư mục đã giải nén.

## Cấu hình và chạy dự án

Tạo `.env` từ `.env.example` rồi điền `PORT`, `DATABASE_URL`, `JWT_SECRET` và `JWT_EXPIRES_IN`. Không commit `.env`. Mật khẩu trong `DATABASE_URL` phải được URL-encode nếu chứa ký tự như `@`, `:` hoặc `/`.

### Chạy với Aiven MySQL Cloud

Tải CA certificate từ trang Overview của service Aiven và lưu thành `prisma/ca.pem`. Trong `.env`, đặt `DATABASE_URL` theo URI của Aiven, thêm `sslaccept=strict&sslcert=ca.pem` vào query string. Đường dẫn `sslcert` được Prisma tính tương đối từ thư mục `prisma`. Không ghi mật khẩu cloud vào README hoặc Git.

```powershell
cd D:\airbnb
npm ci
npx prisma db push
node prisma/seed.mjs
npm run start:dev
```

Seed tạo 33 tài khoản mẫu (mật khẩu `123456`), 5 vị trí, 5 phòng, 33 đặt phòng và 33 bình luận khi database thiếu dữ liệu. Chạy lại seed không tạo trùng. Mở `http://localhost:8080/swagger`; tài khoản mẫu `an@example.com` đăng nhập bằng `123456`.

### Chạy API local, MySQL trong Docker

`docker-compose.yml` có service `mysql_db` chạy MySQL 8 trên `127.0.0.1:3307`, không chiếm cổng `3306` của MySQL đã cài trên máy. Khi khởi tạo volume mới, MySQL tự chạy `db_airbnb.sql` để tạo 5 bảng và dữ liệu mẫu.

```powershell
cd D:\airbnb
npm ci
Copy-Item .env.example .env
notepad .env
docker compose --profile local-db up -d mysql_db
npx prisma db pull
npx prisma generate
npm run build
npm run start:dev
```

Lệnh trên chỉ khởi động database local; `.env` phải dùng `DATABASE_URL` trỏ tới `127.0.0.1:3307` và `MYSQL_ROOT_PASSWORD` khớp với mật khẩu của Docker volume. Chạy API bằng `npm run start:dev`. Để xem dữ liệu bằng MySQL Workbench, kết nối host `127.0.0.1`, port `3307`, user `root`, rồi mở schema `db_airbnb`. Có thể dùng `docker compose --profile local-db down` để dừng container; dữ liệu vẫn nằm trong Docker volume.

### Chạy toàn bộ bằng Docker Compose

Dừng API local nếu nó đang dùng cổng `8080`, sau đó chạy:

```powershell
cd D:\airbnb
docker compose up -d --build
docker compose ps
```

Mặc định Compose chỉ chạy service `airbnb_api`. Service này đọc `DATABASE_URL` từ `.env`, dùng CA trong `prisma/ca.pem`, chạy `prisma db push` và seed trước khi mở `8080:8080`. Service `mysql_db` chỉ bật khi chọn profile `local-db`. Mở `http://localhost:8080/swagger`. Dừng API bằng `docker compose down`.

### Nếu dùng MySQL đã cài trên máy

```powershell
cd D:\airbnb
npm ci
Copy-Item .env.example .env
notepad .env
```

Đổi port trong `DATABASE_URL` từ `3307` thành `3306`, thay `your_password` bằng mật khẩu MySQL hiện có và thay `JWT_SECRET` bằng chuỗi bí mật dài. Nếu mật khẩu chứa ký tự đặc biệt như `@`, `:` hoặc `/`, hãy URL-encode chúng trong URL kết nối.

Đăng nhập MySQL rồi nạp file SQL. Nếu `mysql` chưa nằm trong PATH, dùng đường dẫn đầy đủ đến `mysql.exe`:

```powershell
mysql -u root -p
```

Tại dấu nhắc `mysql>`, chạy lệnh sau với **đường dẫn tuyệt đối thực tế** tới file SQL (dùng dấu `/` trong đường dẫn):

```sql
SOURCE D:/airbnb/db_airbnb.sql;
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
2. `POST /api/auth/signin`: đăng nhập bằng tài khoản mẫu `an@example.com` / `123456`; nhận `token`.
3. `GET /api/users`: lấy toàn bộ người dùng.
4. `POST /api/users`: thêm người dùng; mật khẩu được băm.
5. `DELETE /api/users?id=...`: xóa theo query.
6. `GET /api/users/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=An`: phân trang và lọc tên.
7. `GET /api/users/search/An`: tìm tên.
8. `POST /api/users/upload-avatar`: nhấn **Authorize** trong Swagger, nhập Bearer token từ bước 2, rồi chọn ảnh trong `formFile`.
9. `GET /api/users/1`: xem chi tiết.
10. `PUT /api/users/1`: cập nhật; dùng `birthday`, `password` ở DTO, hệ thống map sang `birth_day`, `pass_word` trong database.

Phản hồi thành công và lỗi đều có `statusCode`, `message`, `content`, `dateTime`. Mật khẩu không được trả về. Ảnh upload được lưu tại `public/img` và truy cập qua `/public/img/<ten-file>`.

## Thử 15 API Ngày 2 trong Swagger

Chạy `npm run build` rồi `npm run start:dev`, mở `http://localhost:8080/swagger`. Đăng nhập bằng `POST /api/auth/signin` với tài khoản mẫu `an@example.com` / `123456`, sao chép `content.token` và nhấn **Authorize**. Các API tạo, sửa, xóa và upload ảnh của ViTri/PhongThue cần JWT. Với ba API phân trang (Users, ViTri, PhongThue), có thể để trống `keyword` và bấm **Execute**; `pageIndex` mặc định 1, `pageSize` mặc định 10.

Swagger chia các API thành bốn nhóm `Auth`, `NguoiDung`, `ViTri`, `Phong` cho Ngày 1-2; toàn dự án có thêm `DatPhong` và `BinhLuan`. Cả 36 endpoint đều có summary và description tiếng Việt, nêu rõ quyền truy cập cùng tham số đầu vào.

### ViTri (7 API)

1. `GET /api/vi-tri`: xem 5 vị trí mẫu.
2. `POST /api/vi-tri`: tạo vị trí, ví dụ `{ "tenViTri": "Quan 3", "tinhThanh": "TP Ho Chi Minh", "quocGia": "Viet Nam" }`; ghi lại `content.id`.
3. `GET /api/vi-tri/phan-trang-tim-kiem`: thử không nhập `keyword`, sau đó thử `keyword=Quan`.
4. `POST /api/vi-tri/upload-hinh-vitri`: nhập `maViTri` là ID vừa tạo và chọn ảnh JPG, PNG hoặc WebP ở `formFile`.
5. `GET /api/vi-tri/{id}`: nhập ID vừa tạo để xem dữ liệu camelCase.
6. `PUT /api/vi-tri/{id}`: thử `{ "tenViTri": "Quan 3 moi" }`.
7. `DELETE /api/vi-tri/{id}`: xóa vị trí vừa tạo. Không xóa vị trí mẫu nếu muốn giữ dữ liệu phòng mẫu vì khóa ngoại đặt `ON DELETE CASCADE`.

### PhongThue (8 API)

1. `GET /api/phong-thue`: xem 5 phòng mẫu.
2. `POST /api/phong-thue`: dùng mẫu JSON hiển thị trong Swagger, đặt `maViTri` bằng ID vị trí đang tồn tại; ghi lại `content.id`.
3. `GET /api/phong-thue/lay-phong-theo-vi-tri?maViTri=1`: xem phòng của vị trí 1.
4. `GET /api/phong-thue/phan-trang-tim-kiem`: thử không nhập `keyword`, sau đó thử `keyword=Can`.
5. `POST /api/phong-thue/upload-hinh-phong`: nhập `maPhong` là ID vừa tạo và chọn ảnh ở `formFile`.
6. `GET /api/phong-thue/{id}`: xem phòng vừa tạo.
7. `PUT /api/phong-thue/{id}`: thử `{ "giaTien": 900000 }`; nếu đổi `maViTri`, ID mới phải tồn tại.
8. `DELETE /api/phong-thue/{id}`: xóa phòng vừa tạo.

Nên thử xóa phòng trước khi xóa vị trí dùng để tạo phòng. Khi upload thành công, `hinhAnh` có dạng `/public/img/<ten-file>`.

## Thử 11 API Ngày 3

Trên Swagger, summary và description của `DatPhong` và `BinhLuan` dùng tiếng Việt như bốn nhóm API còn lại. Dữ liệu gửi lên dùng camelCase; dữ liệu MySQL dùng snake_case. Đăng nhập trước bằng `POST /api/auth/signin` rồi nhấn **Authorize** để lấy quyền tạo, sửa, xóa bình luận.

### DatPhong (6 API)

1. `GET /api/dat-phong`: xem danh sách đặt phòng.
2. `POST /api/dat-phong`: gửi `{ "maPhong": 1, "ngayDen": "2026-11-10T14:00:00.000Z", "ngayDi": "2026-11-12T12:00:00.000Z", "soLuongKhach": 2, "maNguoiDat": 1 }`; ghi lại `content.id`.
3. `GET /api/dat-phong/lay-theo-nguoi-dung/1`: xem đặt phòng của người dùng 1.
4. `GET /api/dat-phong/{id}`: nhập ID vừa tạo.
5. `PUT /api/dat-phong/{id}`: thử `{ "soLuongKhach": 3 }`.
6. `DELETE /api/dat-phong/{id}`: xóa bản ghi vừa tạo.

Ngày đến và ngày đi phải hợp lệ, ngày đi phải sau ngày đến; số khách phải là số nguyên dương. `maPhong` và `maNguoiDat` phải tồn tại.

### BinhLuan (5 API)

1. `GET /api/binh-luan`: xem toàn bộ bình luận.
2. `POST /api/binh-luan`: gửi `{ "maPhong": 1, "maNguoiBinhLuan": 1, "noiDung": "The room is clean", "saoBinhLuan": 5 }`; `ngayBinhLuan` có thể bỏ trống để lấy thời điểm hiện tại. Ghi lại `content.id`.
3. `GET /api/binh-luan/lay-binh-luan-theo-phong/1`: xem bình luận của phòng 1 kèm `tenNguoiBinhLuan` và `avatar`.
4. `PUT /api/binh-luan/{id}`: thử `{ "noiDung": "Updated comment", "saoBinhLuan": 4 }`.
5. `DELETE /api/binh-luan/{id}`: xóa bình luận vừa tạo.

`saoBinhLuan` phải là số nguyên từ 1 đến 5. Ba API ghi bình luận cần Bearer token. Không dùng ID của dữ liệu mẫu khi thử thao tác xóa nếu muốn giữ dữ liệu mẫu.

## Postman Collection

Import `Airbnb_Capstone.postman_collection.json` vào Postman. Collection có **36 request** trong 6 folder: `Auth` (2), `NguoiDung` (8), `ViTri` (7), `Phong` (8), `DatPhong` (6), `BinhLuan` (5). Biến `baseUrl` mặc định là `http://localhost:8080`. Chạy request `Đăng nhập và nhận JWT` đầu tiên; script kiểm thử tự lưu `content.token` vào biến `token`. Các request tạo bản ghi tự lưu ID mới vào `userId`, `locationId`, `roomId`, `bookingId` hoặc `commentId`. Chọn file ảnh thủ công trong các request upload trước khi gửi.

Mỗi request có tên và mô tả Markdown tiếng Việt với bảng tham số Path, Query, Body, quyền truy cập Public hoặc Bearer Token và một Example Response `200 OK`. Năm request PUT chứa đủ trường của DTO tương ứng. Sau khi upload ảnh vị trí hoặc phòng, collection lưu đường dẫn vào `locationImage` hoặc `roomImage` để dùng trong JSON mẫu của request PUT. Mở **View Documentation** trong Postman để xem tài liệu và các phản hồi mẫu.

## Kiểm thử E2E tự động

Khi API local và MySQL đang chạy, thực hiện ở thư mục dự án:

```powershell
node scripts/e2e-verify.cjs
```

Script dùng `fetch` có sẵn của Node.js và `@prisma/client`, không cài thư viện mới. Nó tạo 17 tài khoản qua signup và 16 qua Users, đăng nhập cả 33 tài khoản, kiểm thử đủ 36 route trong Swagger và đối chiếu dữ liệu trực tiếp với MySQL. Báo cáo được ghi vào `e2e-report.md`. Năm bản ghi tạm dùng để thử DELETE (người dùng, vị trí, phòng, đặt phòng, bình luận) sẽ bị xóa; 33 tài khoản, 33 đặt phòng và 33 bình luận được giữ lại. Khi chạy lại, script chỉ xóa bộ dữ liệu QA từ lần chạy trước rồi tạo lại; các bản ghi khác không bị tác động.
