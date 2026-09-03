CREATE TABLE "phien_dang_nhap" (
  "id" UUID NOT NULL,
  "tai_khoan_id" BIGINT NOT NULL,
  "refresh_token_hash" CHAR(64) NOT NULL,
  "het_han_luc" TIMESTAMP(3) NOT NULL,
  "thu_hoi_luc" TIMESTAMP(3),
  "dia_chi_ip" VARCHAR(64),
  "user_agent" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "phien_dang_nhap_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "nhat_ky_dang_nhap" (
  "id" BIGSERIAL NOT NULL,
  "tai_khoan_id" BIGINT,
  "ten_dang_nhap" VARCHAR(100) NOT NULL,
  "thanh_cong" BOOLEAN NOT NULL,
  "dia_chi_ip" VARCHAR(64),
  "user_agent" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "nhat_ky_dang_nhap_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "phien_dang_nhap_tai_khoan_id_thu_hoi_luc_idx" ON "phien_dang_nhap"("tai_khoan_id", "thu_hoi_luc");
CREATE INDEX "phien_dang_nhap_het_han_luc_idx" ON "phien_dang_nhap"("het_han_luc");
CREATE INDEX "nhat_ky_dang_nhap_ten_dang_nhap_created_at_idx" ON "nhat_ky_dang_nhap"("ten_dang_nhap", "created_at");
CREATE INDEX "nhat_ky_dang_nhap_dia_chi_ip_created_at_idx" ON "nhat_ky_dang_nhap"("dia_chi_ip", "created_at");
ALTER TABLE "phien_dang_nhap" ADD CONSTRAINT "phien_dang_nhap_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nhat_ky_dang_nhap" ADD CONSTRAINT "nhat_ky_dang_nhap_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "tai_khoan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
