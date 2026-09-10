-- Fail safely if existing data contains names that differ only by case/outer spaces.
-- Do not silently rename or delete existing accounts.
CREATE UNIQUE INDEX "tai_khoan_ten_dang_nhap_normalized_key"
ON "tai_khoan" (LOWER(BTRIM("ten_dang_nhap")));

CREATE INDEX "nhat_ky_thao_tac_reset_actor_idx"
ON "nhat_ky_thao_tac" ("tai_khoan_id", "hanh_dong", "created_at");
CREATE INDEX "nhat_ky_thao_tac_reset_target_idx"
ON "nhat_ky_thao_tac" ("doi_tuong", "doi_tuong_id", "hanh_dong", "created_at");
