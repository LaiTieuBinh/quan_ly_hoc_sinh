-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VaiTro" AS ENUM ('QUAN_TRI_VIEN', 'NHAN_VIEN', 'GIAO_VIEN', 'HOC_SINH');

-- CreateEnum
CREATE TYPE "TrangThaiTaiKhoan" AS ENUM ('HOAT_DONG', 'BI_KHOA');

-- CreateEnum
CREATE TYPE "CapDo" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');

-- CreateEnum
CREATE TYPE "TrangThaiHocSinh" AS ENUM ('DANG_HOC', 'BAO_LUU', 'NGHI_HOC');

-- CreateEnum
CREATE TYPE "TrangThaiChung" AS ENUM ('HOAT_DONG', 'KHONG_AP_DUNG');

-- CreateEnum
CREATE TYPE "TrangThaiDangKy" AS ENUM ('DANG_HOC', 'DA_KET_THUC', 'DA_HUY');

-- CreateEnum
CREATE TYPE "TrangThaiDiemDanh" AS ENUM ('CO_MAT', 'DI_MUON', 'VANG_CO_PHEP', 'VANG_KHONG_PHEP', 'VE_SOM');

-- CreateEnum
CREATE TYPE "TrangThaiBaiTap" AS ENUM ('NHAP', 'DA_GIAO', 'DONG_NOP');

-- CreateEnum
CREATE TYPE "TrangThaiTaiLieu" AS ENUM ('AN', 'HIEN_THI', 'DA_XOA');

-- CreateEnum
CREATE TYPE "TrangThaiHocPhi" AS ENUM ('CHUA_THU', 'THU_MOT_PHAN', 'DA_THU', 'QUA_HAN');

-- CreateTable
CREATE TABLE "tai_khoan" (
    "id" BIGSERIAL NOT NULL,
    "ten_dang_nhap" VARCHAR(100) NOT NULL,
    "mat_khau_ma_hoa" TEXT NOT NULL,
    "vai_tro" "VaiTro" NOT NULL,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'HOAT_DONG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tai_khoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hoc_sinh" (
    "id" BIGSERIAL NOT NULL,
    "tai_khoan_id" BIGINT,
    "ma_hoc_sinh" VARCHAR(30) NOT NULL,
    "ho_ten" VARCHAR(150) NOT NULL,
    "ngay_sinh" DATE,
    "gioi_tinh" VARCHAR(20),
    "email" VARCHAR(150),
    "so_dien_thoai" VARCHAR(20),
    "dia_chi" TEXT,
    "cap_do_hien_tai" "CapDo" NOT NULL,
    "trang_thai" "TrangThaiHocSinh" NOT NULL DEFAULT 'DANG_HOC',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hoc_sinh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giao_vien" (
    "id" BIGSERIAL NOT NULL,
    "tai_khoan_id" BIGINT,
    "ma_giao_vien" VARCHAR(30) NOT NULL,
    "ho_ten" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "so_dien_thoai" VARCHAR(20),
    "chuyen_mon" TEXT,
    "cap_do_giang_day" "CapDo"[],
    "trang_thai" "TrangThaiChung" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "giao_vien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lich_su_cap_do" (
    "id" BIGSERIAL NOT NULL,
    "hoc_sinh_id" BIGINT NOT NULL,
    "cap_do_cu" "CapDo",
    "cap_do_moi" "CapDo" NOT NULL,
    "ngay_ap_dung" DATE NOT NULL,
    "ly_do" TEXT,
    "nguoi_thuc_hien_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lich_su_cap_do_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nien_khoa" (
    "id" BIGSERIAL NOT NULL,
    "ten" VARCHAR(100) NOT NULL,
    "ngay_bat_dau" DATE NOT NULL,
    "ngay_ket_thuc" DATE NOT NULL,
    "trang_thai" "TrangThaiChung" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "nien_khoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ky_hoc" (
    "id" BIGSERIAL NOT NULL,
    "nien_khoa_id" BIGINT NOT NULL,
    "ten" VARCHAR(100) NOT NULL,
    "ngay_bat_dau" DATE NOT NULL,
    "ngay_ket_thuc" DATE NOT NULL,
    "trang_thai" "TrangThaiChung" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "ky_hoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mon_hoc" (
    "id" BIGSERIAL NOT NULL,
    "ma_mon" VARCHAR(30) NOT NULL,
    "ten_mon" VARCHAR(100) NOT NULL,
    "mo_ta" TEXT,
    "trang_thai" "TrangThaiChung" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "mon_hoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lop_hoc" (
    "id" BIGSERIAL NOT NULL,
    "nien_khoa_id" BIGINT NOT NULL,
    "ky_hoc_id" BIGINT NOT NULL,
    "ma_lop" VARCHAR(30) NOT NULL,
    "ten_lop" VARCHAR(150) NOT NULL,
    "cap_do" "CapDo" NOT NULL,
    "phong" VARCHAR(50),
    "trang_thai" "TrangThaiChung" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "lop_hoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dang_ky_lop" (
    "id" BIGSERIAL NOT NULL,
    "hoc_sinh_id" BIGINT NOT NULL,
    "lop_hoc_id" BIGINT NOT NULL,
    "ngay_dang_ky" DATE NOT NULL,
    "ngay_ket_thuc" DATE,
    "trang_thai" "TrangThaiDangKy" NOT NULL DEFAULT 'DANG_HOC',
    "ghi_chu" TEXT,

    CONSTRAINT "dang_ky_lop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phan_cong" (
    "id" BIGSERIAL NOT NULL,
    "giao_vien_id" BIGINT NOT NULL,
    "lop_hoc_id" BIGINT NOT NULL,
    "mon_hoc_id" BIGINT NOT NULL,
    "vai_tro" VARCHAR(50) NOT NULL,
    "tu_ngay" DATE NOT NULL,
    "den_ngay" DATE,
    "trang_thai" "TrangThaiChung" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "phan_cong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buoi_hoc" (
    "id" BIGSERIAL NOT NULL,
    "phan_cong_id" BIGINT NOT NULL,
    "phong" VARCHAR(50) NOT NULL,
    "bat_dau" TIMESTAMP(3) NOT NULL,
    "ket_thuc" TIMESTAMP(3) NOT NULL,
    "trang_thai" VARCHAR(30) NOT NULL DEFAULT 'DA_LEN_LICH',

    CONSTRAINT "buoi_hoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diem_danh" (
    "id" BIGSERIAL NOT NULL,
    "buoi_hoc_id" BIGINT NOT NULL,
    "hoc_sinh_id" BIGINT NOT NULL,
    "trang_thai" "TrangThaiDiemDanh" NOT NULL,
    "ghi_chu" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "nguoi_thuc_hien_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diem_danh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dot_danh_gia" (
    "id" BIGSERIAL NOT NULL,
    "lop_hoc_id" BIGINT NOT NULL,
    "mon_hoc_id" BIGINT NOT NULL,
    "ten" VARCHAR(150) NOT NULL,
    "loai" VARCHAR(50) NOT NULL,
    "ky_nang" VARCHAR(50) NOT NULL,
    "ngay_danh_gia" DATE NOT NULL,
    "thang_diem" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "da_cong_bo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dot_danh_gia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diem" (
    "id" BIGSERIAL NOT NULL,
    "dot_danh_gia_id" BIGINT NOT NULL,
    "hoc_sinh_id" BIGINT NOT NULL,
    "diem" DECIMAL(5,2) NOT NULL,
    "nhan_xet" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "nguoi_thuc_hien_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ky_thi_jlpt" (
    "id" BIGSERIAL NOT NULL,
    "hoc_sinh_id" BIGINT NOT NULL,
    "loai" VARCHAR(30) NOT NULL,
    "cap_do" "CapDo" NOT NULL,
    "ngay_thi" DATE NOT NULL,
    "diem" DECIMAL(6,2),
    "ket_qua" VARCHAR(30) NOT NULL,

    CONSTRAINT "ky_thi_jlpt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nghia_vu_hoc_phi" (
    "id" BIGSERIAL NOT NULL,
    "hoc_sinh_id" BIGINT NOT NULL,
    "lop_hoc_id" BIGINT NOT NULL,
    "so_tien_phai_thu" DECIMAL(14,2) NOT NULL,
    "mien_giam" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "han_thu" DATE,
    "trang_thai" "TrangThaiHocPhi" NOT NULL DEFAULT 'CHUA_THU',
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "nghia_vu_hoc_phi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giao_dich_hoc_phi" (
    "id" BIGSERIAL NOT NULL,
    "nghia_vu_hoc_phi_id" BIGINT NOT NULL,
    "nguoi_thu_id" BIGINT NOT NULL,
    "idempotency_key" VARCHAR(100) NOT NULL,
    "so_tien" DECIMAL(14,2) NOT NULL,
    "ngay_thu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phuong_thuc" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giao_dich_hoc_phi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bai_tap" (
    "id" BIGSERIAL NOT NULL,
    "lop_hoc_id" BIGINT NOT NULL,
    "mon_hoc_id" BIGINT NOT NULL,
    "nguoi_tao_id" BIGINT NOT NULL,
    "tieu_de" VARCHAR(200) NOT NULL,
    "mo_ta" TEXT,
    "han_nop" TIMESTAMP(3) NOT NULL,
    "thang_diem" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "trang_thai" "TrangThaiBaiTap" NOT NULL DEFAULT 'NHAP',

    CONSTRAINT "bai_tap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bai_nop" (
    "id" BIGSERIAL NOT NULL,
    "bai_tap_id" BIGINT NOT NULL,
    "hoc_sinh_id" BIGINT NOT NULL,
    "noi_dung" TEXT,
    "thoi_diem_nop" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diem" DECIMAL(5,2),
    "nhan_xet" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "bai_nop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tai_lieu" (
    "id" BIGSERIAL NOT NULL,
    "nguoi_tao_id" BIGINT NOT NULL,
    "lop_hoc_id" BIGINT,
    "mon_hoc_id" BIGINT,
    "cap_do" "CapDo",
    "tieu_de" VARCHAR(200) NOT NULL,
    "mo_ta" TEXT,
    "url" TEXT,
    "trang_thai" "TrangThaiTaiLieu" NOT NULL DEFAULT 'AN',

    CONSTRAINT "tai_lieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhat_ky_thao_tac" (
    "id" BIGSERIAL NOT NULL,
    "tai_khoan_id" BIGINT NOT NULL,
    "hanh_dong" VARCHAR(100) NOT NULL,
    "doi_tuong" VARCHAR(100) NOT NULL,
    "doi_tuong_id" VARCHAR(50) NOT NULL,
    "du_lieu" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhat_ky_thao_tac_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tai_khoan_ten_dang_nhap_key" ON "tai_khoan"("ten_dang_nhap");

-- CreateIndex
CREATE UNIQUE INDEX "hoc_sinh_tai_khoan_id_key" ON "hoc_sinh"("tai_khoan_id");

-- CreateIndex
CREATE UNIQUE INDEX "hoc_sinh_ma_hoc_sinh_key" ON "hoc_sinh"("ma_hoc_sinh");

-- CreateIndex
CREATE INDEX "hoc_sinh_ho_ten_idx" ON "hoc_sinh"("ho_ten");

-- CreateIndex
CREATE UNIQUE INDEX "giao_vien_tai_khoan_id_key" ON "giao_vien"("tai_khoan_id");

-- CreateIndex
CREATE UNIQUE INDEX "giao_vien_ma_giao_vien_key" ON "giao_vien"("ma_giao_vien");

-- CreateIndex
CREATE INDEX "lich_su_cap_do_hoc_sinh_id_ngay_ap_dung_idx" ON "lich_su_cap_do"("hoc_sinh_id", "ngay_ap_dung");

-- CreateIndex
CREATE UNIQUE INDEX "nien_khoa_ten_key" ON "nien_khoa"("ten");

-- CreateIndex
CREATE UNIQUE INDEX "ky_hoc_nien_khoa_id_ten_key" ON "ky_hoc"("nien_khoa_id", "ten");

-- CreateIndex
CREATE UNIQUE INDEX "ky_hoc_id_nien_khoa_id_key" ON "ky_hoc"("id", "nien_khoa_id");

-- CreateIndex
CREATE UNIQUE INDEX "mon_hoc_ma_mon_key" ON "mon_hoc"("ma_mon");

-- CreateIndex
CREATE UNIQUE INDEX "lop_hoc_ma_lop_key" ON "lop_hoc"("ma_lop");

-- CreateIndex
CREATE INDEX "lop_hoc_cap_do_trang_thai_idx" ON "lop_hoc"("cap_do", "trang_thai");

-- CreateIndex
CREATE INDEX "dang_ky_lop_lop_hoc_id_trang_thai_idx" ON "dang_ky_lop"("lop_hoc_id", "trang_thai");

-- CreateIndex
CREATE UNIQUE INDEX "dang_ky_lop_hoc_sinh_id_lop_hoc_id_ngay_dang_ky_key" ON "dang_ky_lop"("hoc_sinh_id", "lop_hoc_id", "ngay_dang_ky");

-- CreateIndex
CREATE INDEX "phan_cong_giao_vien_id_tu_ngay_den_ngay_idx" ON "phan_cong"("giao_vien_id", "tu_ngay", "den_ngay");

-- CreateIndex
CREATE INDEX "buoi_hoc_bat_dau_ket_thuc_idx" ON "buoi_hoc"("bat_dau", "ket_thuc");

-- CreateIndex
CREATE UNIQUE INDEX "diem_danh_buoi_hoc_id_hoc_sinh_id_key" ON "diem_danh"("buoi_hoc_id", "hoc_sinh_id");

-- CreateIndex
CREATE UNIQUE INDEX "diem_dot_danh_gia_id_hoc_sinh_id_key" ON "diem"("dot_danh_gia_id", "hoc_sinh_id");

-- CreateIndex
CREATE INDEX "nghia_vu_hoc_phi_hoc_sinh_id_trang_thai_idx" ON "nghia_vu_hoc_phi"("hoc_sinh_id", "trang_thai");

-- CreateIndex
CREATE UNIQUE INDEX "giao_dich_hoc_phi_idempotency_key_key" ON "giao_dich_hoc_phi"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "bai_nop_bai_tap_id_hoc_sinh_id_key" ON "bai_nop"("bai_tap_id", "hoc_sinh_id");

-- CreateIndex
CREATE INDEX "tai_lieu_cap_do_trang_thai_idx" ON "tai_lieu"("cap_do", "trang_thai");

-- CreateIndex
CREATE INDEX "nhat_ky_thao_tac_doi_tuong_doi_tuong_id_idx" ON "nhat_ky_thao_tac"("doi_tuong", "doi_tuong_id");

-- AddForeignKey
ALTER TABLE "hoc_sinh" ADD CONSTRAINT "hoc_sinh_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "tai_khoan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giao_vien" ADD CONSTRAINT "giao_vien_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "tai_khoan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lich_su_cap_do" ADD CONSTRAINT "lich_su_cap_do_hoc_sinh_id_fkey" FOREIGN KEY ("hoc_sinh_id") REFERENCES "hoc_sinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lich_su_cap_do" ADD CONSTRAINT "lich_su_cap_do_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ky_hoc" ADD CONSTRAINT "ky_hoc_nien_khoa_id_fkey" FOREIGN KEY ("nien_khoa_id") REFERENCES "nien_khoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lop_hoc" ADD CONSTRAINT "lop_hoc_nien_khoa_id_fkey" FOREIGN KEY ("nien_khoa_id") REFERENCES "nien_khoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lop_hoc" ADD CONSTRAINT "lop_hoc_ky_hoc_id_nien_khoa_id_fkey" FOREIGN KEY ("ky_hoc_id", "nien_khoa_id") REFERENCES "ky_hoc"("id", "nien_khoa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dang_ky_lop" ADD CONSTRAINT "dang_ky_lop_hoc_sinh_id_fkey" FOREIGN KEY ("hoc_sinh_id") REFERENCES "hoc_sinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dang_ky_lop" ADD CONSTRAINT "dang_ky_lop_lop_hoc_id_fkey" FOREIGN KEY ("lop_hoc_id") REFERENCES "lop_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_cong" ADD CONSTRAINT "phan_cong_giao_vien_id_fkey" FOREIGN KEY ("giao_vien_id") REFERENCES "giao_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_cong" ADD CONSTRAINT "phan_cong_lop_hoc_id_fkey" FOREIGN KEY ("lop_hoc_id") REFERENCES "lop_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_cong" ADD CONSTRAINT "phan_cong_mon_hoc_id_fkey" FOREIGN KEY ("mon_hoc_id") REFERENCES "mon_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buoi_hoc" ADD CONSTRAINT "buoi_hoc_phan_cong_id_fkey" FOREIGN KEY ("phan_cong_id") REFERENCES "phan_cong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_buoi_hoc_id_fkey" FOREIGN KEY ("buoi_hoc_id") REFERENCES "buoi_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_hoc_sinh_id_fkey" FOREIGN KEY ("hoc_sinh_id") REFERENCES "hoc_sinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dot_danh_gia" ADD CONSTRAINT "dot_danh_gia_lop_hoc_id_fkey" FOREIGN KEY ("lop_hoc_id") REFERENCES "lop_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dot_danh_gia" ADD CONSTRAINT "dot_danh_gia_mon_hoc_id_fkey" FOREIGN KEY ("mon_hoc_id") REFERENCES "mon_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem" ADD CONSTRAINT "diem_dot_danh_gia_id_fkey" FOREIGN KEY ("dot_danh_gia_id") REFERENCES "dot_danh_gia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem" ADD CONSTRAINT "diem_hoc_sinh_id_fkey" FOREIGN KEY ("hoc_sinh_id") REFERENCES "hoc_sinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem" ADD CONSTRAINT "diem_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ky_thi_jlpt" ADD CONSTRAINT "ky_thi_jlpt_hoc_sinh_id_fkey" FOREIGN KEY ("hoc_sinh_id") REFERENCES "hoc_sinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nghia_vu_hoc_phi" ADD CONSTRAINT "nghia_vu_hoc_phi_hoc_sinh_id_fkey" FOREIGN KEY ("hoc_sinh_id") REFERENCES "hoc_sinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nghia_vu_hoc_phi" ADD CONSTRAINT "nghia_vu_hoc_phi_lop_hoc_id_fkey" FOREIGN KEY ("lop_hoc_id") REFERENCES "lop_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giao_dich_hoc_phi" ADD CONSTRAINT "giao_dich_hoc_phi_nghia_vu_hoc_phi_id_fkey" FOREIGN KEY ("nghia_vu_hoc_phi_id") REFERENCES "nghia_vu_hoc_phi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giao_dich_hoc_phi" ADD CONSTRAINT "giao_dich_hoc_phi_nguoi_thu_id_fkey" FOREIGN KEY ("nguoi_thu_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bai_tap" ADD CONSTRAINT "bai_tap_lop_hoc_id_fkey" FOREIGN KEY ("lop_hoc_id") REFERENCES "lop_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bai_tap" ADD CONSTRAINT "bai_tap_mon_hoc_id_fkey" FOREIGN KEY ("mon_hoc_id") REFERENCES "mon_hoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bai_tap" ADD CONSTRAINT "bai_tap_nguoi_tao_id_fkey" FOREIGN KEY ("nguoi_tao_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bai_nop" ADD CONSTRAINT "bai_nop_bai_tap_id_fkey" FOREIGN KEY ("bai_tap_id") REFERENCES "bai_tap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bai_nop" ADD CONSTRAINT "bai_nop_hoc_sinh_id_fkey" FOREIGN KEY ("hoc_sinh_id") REFERENCES "hoc_sinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tai_lieu" ADD CONSTRAINT "tai_lieu_nguoi_tao_id_fkey" FOREIGN KEY ("nguoi_tao_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tai_lieu" ADD CONSTRAINT "tai_lieu_lop_hoc_id_fkey" FOREIGN KEY ("lop_hoc_id") REFERENCES "lop_hoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tai_lieu" ADD CONSTRAINT "tai_lieu_mon_hoc_id_fkey" FOREIGN KEY ("mon_hoc_id") REFERENCES "mon_hoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_thao_tac" ADD CONSTRAINT "nhat_ky_thao_tac_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain invariants documented in the ERD specification.
ALTER TABLE "nien_khoa"
    ADD CONSTRAINT "nien_khoa_ngay_hop_le" CHECK ("ngay_bat_dau" <= "ngay_ket_thuc");

ALTER TABLE "ky_hoc"
    ADD CONSTRAINT "ky_hoc_ngay_hop_le" CHECK ("ngay_bat_dau" <= "ngay_ket_thuc");

ALTER TABLE "phan_cong"
    ADD CONSTRAINT "phan_cong_ngay_hop_le" CHECK ("den_ngay" IS NULL OR "tu_ngay" <= "den_ngay");

ALTER TABLE "buoi_hoc"
    ADD CONSTRAINT "buoi_hoc_thoi_gian_hop_le" CHECK ("bat_dau" < "ket_thuc");

ALTER TABLE "dot_danh_gia"
    ADD CONSTRAINT "dot_danh_gia_thang_diem_duong" CHECK ("thang_diem" > 0);

ALTER TABLE "diem"
    ADD CONSTRAINT "diem_khong_am" CHECK ("diem" >= 0);

ALTER TABLE "nghia_vu_hoc_phi"
    ADD CONSTRAINT "nghia_vu_hoc_phi_so_tien_hop_le"
    CHECK ("so_tien_phai_thu" >= 0 AND "mien_giam" >= 0 AND "mien_giam" <= "so_tien_phai_thu");

ALTER TABLE "giao_dich_hoc_phi"
    ADD CONSTRAINT "giao_dich_hoc_phi_so_tien_duong" CHECK ("so_tien" > 0);

ALTER TABLE "bai_tap"
    ADD CONSTRAINT "bai_tap_thang_diem_duong" CHECK ("thang_diem" > 0);

ALTER TABLE "bai_nop"
    ADD CONSTRAINT "bai_nop_diem_khong_am" CHECK ("diem" IS NULL OR "diem" >= 0);
