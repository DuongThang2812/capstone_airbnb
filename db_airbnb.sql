CREATE DATABASE IF NOT EXISTS db_airbnb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_airbnb;

CREATE TABLE IF NOT EXISTS NguoiDung (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pass_word VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  birth_day VARCHAR(50) NULL,
  gender BOOLEAN NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  avatar VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_nguoi_dung_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ViTri (
  id INT NOT NULL AUTO_INCREMENT,
  ten_vi_tri VARCHAR(255) NOT NULL,
  tinh_thanh VARCHAR(255) NOT NULL,
  quoc_gia VARCHAR(255) NOT NULL,
  hinh_anh VARCHAR(255) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Phong (
  id INT NOT NULL AUTO_INCREMENT,
  ten_phong VARCHAR(255) NOT NULL,
  khach INT NOT NULL,
  phong_ngu INT NOT NULL,
  giuong INT NOT NULL,
  phong_tam INT NOT NULL,
  mo_ta TEXT NOT NULL,
  gia_tien INT NOT NULL,
  may_giat BOOLEAN NOT NULL,
  ban_la BOOLEAN NOT NULL,
  tivi BOOLEAN NOT NULL,
  dieu_hoa BOOLEAN NOT NULL,
  wifi BOOLEAN NOT NULL,
  bep BOOLEAN NOT NULL,
  do_xe BOOLEAN NOT NULL,
  ho_boi BOOLEAN NOT NULL,
  ban_ui BOOLEAN NOT NULL,
  ma_vi_tri INT NOT NULL,
  hinh_anh VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_phong_ma_vi_tri (ma_vi_tri),
  CONSTRAINT fk_phong_vi_tri FOREIGN KEY (ma_vi_tri)
    REFERENCES ViTri(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS DatPhong (
  id INT NOT NULL AUTO_INCREMENT,
  ma_phong INT NOT NULL,
  ngay_den DATETIME NOT NULL,
  ngay_di DATETIME NOT NULL,
  so_luong_khach INT NOT NULL,
  ma_nguoi_dat INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_dat_phong_ma_phong (ma_phong),
  KEY idx_dat_phong_ma_nguoi_dat (ma_nguoi_dat),
  CONSTRAINT fk_dat_phong_phong FOREIGN KEY (ma_phong)
    REFERENCES Phong(id) ON DELETE CASCADE,
  CONSTRAINT fk_dat_phong_nguoi_dung FOREIGN KEY (ma_nguoi_dat)
    REFERENCES NguoiDung(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS BinhLuan (
  id INT NOT NULL AUTO_INCREMENT,
  ma_phong INT NOT NULL,
  ma_nguoi_binh_luan INT NOT NULL,
  ngay_binh_luan DATETIME NOT NULL,
  noi_dung TEXT NOT NULL,
  sao_binh_luan INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_binh_luan_ma_phong (ma_phong),
  KEY idx_binh_luan_ma_nguoi_binh_luan (ma_nguoi_binh_luan),
  CONSTRAINT fk_binh_luan_phong FOREIGN KEY (ma_phong)
    REFERENCES Phong(id) ON DELETE CASCADE,
  CONSTRAINT fk_binh_luan_nguoi_dung FOREIGN KEY (ma_nguoi_binh_luan)
    REFERENCES NguoiDung(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Mật khẩu của cả 5 tài khoản mẫu: Password@123
INSERT INTO NguoiDung (name, email, pass_word, phone, birth_day, gender, role, avatar) VALUES
('Nguyen An', 'an@example.com', '$2b$10$JVV51.CEu2Ed6QXLltdIqeKHRoi/naChzvU9kJ9Ron4jIBUbktQKm', '0901000001', '1995-01-15', TRUE, 'USER', NULL),
('Tran Binh', 'binh@example.com', '$2b$10$JVV51.CEu2Ed6QXLltdIqeKHRoi/naChzvU9kJ9Ron4jIBUbktQKm', '0901000002', '1994-02-20', TRUE, 'USER', NULL),
('Le Chi', 'chi@example.com', '$2b$10$JVV51.CEu2Ed6QXLltdIqeKHRoi/naChzvU9kJ9Ron4jIBUbktQKm', '0901000003', '1996-03-25', FALSE, 'USER', NULL),
('Pham Dung', 'dung@example.com', '$2b$10$JVV51.CEu2Ed6QXLltdIqeKHRoi/naChzvU9kJ9Ron4jIBUbktQKm', '0901000004', '1992-04-10', FALSE, 'USER', NULL),
('Vo Em', 'em@example.com', '$2b$10$JVV51.CEu2Ed6QXLltdIqeKHRoi/naChzvU9kJ9Ron4jIBUbktQKm', '0901000005', '1998-05-05', TRUE, 'USER', NULL);

INSERT INTO ViTri (ten_vi_tri, tinh_thanh, quoc_gia, hinh_anh) VALUES
('Quan 1', 'TP Ho Chi Minh', 'Viet Nam', '/img/quan-1.jpg'),
('Hoan Kiem', 'Ha Noi', 'Viet Nam', '/img/hoan-kiem.jpg'),
('Hai Chau', 'Da Nang', 'Viet Nam', '/img/hai-chau.jpg'),
('Ninh Kieu', 'Can Tho', 'Viet Nam', '/img/ninh-kieu.jpg'),
('Duong Dong', 'Phu Quoc', 'Viet Nam', '/img/duong-dong.jpg');

INSERT INTO Phong (ten_phong, khach, phong_ngu, giuong, phong_tam, mo_ta, gia_tien,
  may_giat, ban_la, tivi, dieu_hoa, wifi, bep, do_xe, ho_boi, ban_ui, ma_vi_tri, hinh_anh) VALUES
('Can ho trung tam', 2, 1, 1, 1, 'Can ho gan cho Ben Thanh', 850000, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, 1, '/img/phong-1.jpg'),
('Phong pho co', 3, 1, 2, 1, 'Phong o khu pho co Ha Noi', 720000, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, 2, '/img/phong-2.jpg'),
('Can ho gan bien', 4, 2, 2, 2, 'Can ho gan bien My Khe', 1300000, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 3, '/img/phong-3.jpg'),
('Nha ven song', 5, 2, 3, 2, 'Nha nghi ven song Hau', 1100000, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 4, '/img/phong-4.jpg'),
('Villa dao ngoc', 6, 3, 3, 3, 'Villa co ho boi rieng', 2800000, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 5, '/img/phong-5.jpg');

INSERT INTO DatPhong (ma_phong, ngay_den, ngay_di, so_luong_khach, ma_nguoi_dat) VALUES
(1, '2026-11-02 14:00:00', '2026-11-04 12:00:00', 2, 1),
(2, '2026-11-05 14:00:00', '2026-11-07 12:00:00', 2, 2),
(3, '2026-11-08 14:00:00', '2026-11-10 12:00:00', 4, 3),
(4, '2026-11-11 14:00:00', '2026-11-13 12:00:00', 3, 4),
(5, '2026-11-14 14:00:00', '2026-11-16 12:00:00', 5, 5);

INSERT INTO BinhLuan (ma_phong, ma_nguoi_binh_luan, ngay_binh_luan, noi_dung, sao_binh_luan) VALUES
(1, 1, '2026-10-10 10:00:00', 'Phong sach se, vi tri thuan tien', 5),
(2, 2, '2026-10-11 11:00:00', 'Chu nha than thien', 5),
(3, 3, '2026-10-12 12:00:00', 'Gan bien va day du tien nghi', 4),
(4, 4, '2026-10-13 13:00:00', 'Khong gian yen tinh', 4),
(5, 5, '2026-10-14 14:00:00', 'Ho boi dep', 5);
